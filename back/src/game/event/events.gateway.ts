import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BallMoveEvent, GamePlayer, RoomStoreService } from '../store/room-store.service';


@WebSocketGateway({ namespace: '/events', cors: true })
export class EventsGateway {

  paddleWidth: number;
  paddleHeight: number;
  paddleGapWithWall: number;
  canvasHeight: number;
  canvasWidth: number;
  ballRadius: number;

  constructor(private roomStoreService: RoomStoreService) {
    this.paddleWidth = 3;
    this.paddleHeight = 100;
    this.paddleGapWithWall = 30;
    this.canvasHeight = 400;
    this.canvasWidth = 800;
    this.ballRadius = 10;
   }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() data: { room: string, name: string }, @ConnectedSocket() client: Socket) {
    // si la room existe pas encore
    const mapPong = this.roomStoreService.getMapPong();
    if (!mapPong.get(data.room)) {
      mapPong.set(data.room, {
        "map": new Map(), "players": [], "game": {
          xBall: 200,
          yBall: 200,
          xSpeed: 3,
          ySpeed: 3,
          canvasWidth: this.canvasWidth,
          canvasHeight: this.canvasHeight,
          paddleWidth: 3,
          paddleHeight: 100,
          leftPaddlePositionY: 100,
          rightPaddlePositionY: 100,
          victoryPoints: 5,
          ballRadius: 10
        }
      })
    }
    // on associe le user au socket
    client.data.username = data.name;
    // on add le user dans la room
    client.join(data.room);
    // si déjà deux joueurs dans les players
    if (mapPong.get(data.room).players.length === 2) {
      if (!mapPong.get(data.room).map.get(data.name)) {
        // déjà 2 joueurs dans la partie mais pas le joueur qui join
        return
      }
      // le joueur qui join était déjà dans la partie
      const players = this.getPlayerRightAndPlayerLeft(data.room);
      client.emit('gameData', { gameData: mapPong.get(data.room).game, playerRight: players.right, playerLeft: players.left })
      client.emit('yourPosition', { y: mapPong.get(data.room).map.get(data.name).y, side: mapPong.get(data.room).map.get(data.name).side })
      return { event: 'joinedRoom', data: `Joined room: ${data.room}` };
    }


    // le joueur arrive dans la partie et c'est le premier
    if (!mapPong.get(data.room).map.get(data.name) && mapPong.get(data.room).players.length === 0) {
      mapPong.get(data.room).map.set(data.name, { name: data.name, x: this.paddleGapWithWall, y: 100, side: "LEFT", score: 0 });
      mapPong.get(data.room).players.push(data.name)
      mapPong.get(data.room).players = [...new Set(mapPong.get(data.room).players)] as string[]
      client.emit('startGame', { eventName: "waiting" })
      client.emit('yourPosition', { y: mapPong.get(data.room).game.leftPaddlePositionY, side: "LEFT" })
      return { event: 'joinedRoom', data: `Joined room: ${data.room}` };
    }

    // le joueur arrive dans la partie et c'est le deuxième
    if (!mapPong.get(data.room).map[data.name] && mapPong.get(data.room).players.length === 1) {
      mapPong.get(data.room).map.set(data.name, { name: data.name, x: this.canvasHeight - this.paddleGapWithWall, y: 100, side: "RIGHT", score: 0 })
      mapPong.get(data.room).players.push(data.name)
      mapPong.get(data.room).players = [...new Set(mapPong.get(data.room).players)] as string[]
      const players = this.getPlayerRightAndPlayerLeft(data.room);
      this.server.to(data.room).emit('startGame',
        { eventName: "start", playerRight: players.right, playerLeft: players.left, gameData: mapPong.get(data.room).game }
      );
      client.emit('yourPosition', { y: mapPong.get(data.room).game.rightPaddlePositionY, side: "RIGHT" })
      this.launchGame(data.room, client);
      return { event: 'joinedRoom', data: `Joined room: ${data.room}` };
    }

    // visiteur
    //const players = this.getPlayerRightAndPlayerLeft(data.room);
    //client.emit('gameData', { gameData: mapPong.get(data.room).game, playerRight: players.right, playerLeft: players.left })
    return { event: 'joinedRoom', data: `Joined room: ${data.room}` };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    client.leave(data.room);
    return { event: 'leftRoom', data: `Left room: ${data.room}` };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: { room: string; message: string }) {
    const sockets = await this.server.in(data.room).allSockets();
    this.server.to(data.room).emit('newMessage', data.message);
    return { event: 'messageSent', data: `Message sent to room: ${data.room}` };
  }

  @SubscribeMessage('movePaddleClient')
  async handlePlay(
    @MessageBody() data: { room: string; direction: 'UP' | 'DOWN' },
    @ConnectedSocket() client: Socket
  ) {
    const mapPlayer = this.roomStoreService.getMapPong();
    const sockets = await this.server.in(data.room).allSockets();
    let paddlePositionY = mapPlayer.get(data.room).map.get(client.data.username).y;
    const translation = 15;
    const maxHeight = ((this.canvasHeight - (paddlePositionY + this.paddleHeight)) <= translation);
    const minHeight = (paddlePositionY < translation);
    /*console.log("maxHeight: " + maxHeight)
    console.log("minHeight: " + minHeight)
    console.log("paddlePositionY: " + paddlePositionY)
    console.log("canvaHeight = " + mapPlayer.get(data.room).game.canvasHeight)
    console.log("top: " + (paddlePositionY + this.paddleHeight))
    console.log("bottom: " + paddlePositionY)*/
    if (data.direction === "UP" && !minHeight ) {
      paddlePositionY -= translation;
    } else if (data.direction === "DOWN" && !maxHeight) {
      paddlePositionY += translation;
    }
    client.emit("moveMyPaddle", { "y": paddlePositionY });
    // client.broadcast.to(data.room) -> tous les gens de la room sauf toi
    client.broadcast.to(data.room).emit('movePaddleOpponent', { "y": paddlePositionY });
    mapPlayer.get(data.room).map.get(client.data.username).y = paddlePositionY;
    return { event: 'messageSent', data: `Message sent to room: ${data.room}` };
  }

  async launchGame(room: string, client: Socket) {
    const mapPlayer = this.roomStoreService.getMapPong();
    const player1 = mapPlayer.get(room).map.get(mapPlayer.get(room).players[0])
    const player2 = mapPlayer.get(room).map.get(mapPlayer.get(room).players[1])
    const playerRight = player1.side === "RIGHT" ? player1 : player2;
    const playerLeft = player1.side === "LEFT" ? player1 : player2;
    const intervalId = setInterval(() => {
      const stop = this.handleGame(room, playerRight, playerLeft, client)
      if (stop === 1) {
        clearInterval(intervalId);
        return;
      }
      this.notifyRoomWithBallStat(room);
    }, 1000 / 24);
  }

  notifyRoomWithBallStat(room: string) {
    const mapPlayer = this.roomStoreService.getMapPong();
    let { xBall, yBall } = mapPlayer.get(room).game;
    const ballStat: BallMoveEvent = {
      x: xBall,
      y: yBall,
    }
    this.server.to(room).emit("ballPositionEvent", ballStat);
  }


  handleGame(room: string, rightPlayer: GamePlayer, leftPlayer: GamePlayer, client: Socket) {
    const mapPong = this.roomStoreService.getMapPong();
    let { ballRadius, xBall, xSpeed, yBall, ySpeed, canvasHeight, canvasWidth, victoryPoints } = mapPong.get(room).game;
    xBall += xSpeed;
    yBall += ySpeed;
    const __retBouncing = this.handleBouncingOnWall(ballRadius, yBall, ySpeed, canvasHeight, xBall, xSpeed, canvasWidth);
    ySpeed = __retBouncing.ySpeed;
    xSpeed = __retBouncing.xSpeed;

    //Touche Pad du joueur de gauche
    const handledBouncingOnPaddle = this.handleBouncingOnPaddle(xBall, ballRadius, this.paddleWidth, yBall, leftPlayer, this.paddleHeight, xSpeed, ySpeed, canvasWidth, rightPlayer);
    xSpeed = handledBouncingOnPaddle.xSpeed;
    ySpeed = handledBouncingOnPaddle.ySpeed;

    const handledScore = this.handleScore(xBall, ballRadius, canvasWidth, leftPlayer, yBall, room, rightPlayer, this.paddleWidth, xSpeed, ySpeed, victoryPoints);
    
    //end of the game
    if (handledScore.end_game) {
      let winner = rightPlayer;
      let looser = leftPlayer;
      if (leftPlayer.score > rightPlayer.score) {
        winner = leftPlayer;
        looser = rightPlayer
      }
      this.server.to(room).emit('endGame', {
        leftPlayer: leftPlayer, 
        rightPlayer: rightPlayer,
        looser: looser, 
        winner: winner,
        left_score: leftPlayer.score, 
        right_score: rightPlayer.score
      })
      return 1;
    }
    
    xBall = handledScore.xBall;
    yBall = handledScore.yBall;
    xSpeed = handledScore.xSpeed;
    ySpeed = handledScore.ySpeed;

    mapPong.get(room).game = {
      ...mapPong.get(room).game,
      xBall, xSpeed, yBall, ySpeed
    }
  }

  private ballIsTouchingLeftPaddle(xBall: number, ballRadius: number, paddleWidth: number, yBall: number, leftPlayer: GamePlayer, paddleHeight: number) {
    return xBall - ballRadius <= leftPlayer.x + paddleWidth && yBall - this.ballRadius >= leftPlayer.y && yBall + this.ballRadius <= leftPlayer.y + paddleHeight;
  }

  private ballIsTouchingRightPaddle(xBall: number, ballRadius: number, paddleWidth: number, yBall: number, rightPlayer: GamePlayer, paddleHeight: number, canvaWidth: number) {
    return xBall + ballRadius >= canvaWidth - paddleWidth - this.paddleGapWithWall && yBall - this.ballRadius >= rightPlayer.y && yBall + this.ballRadius <= rightPlayer.y + paddleHeight;
  }

  private handleBouncingOnPaddle(xBall: number, ballRadius: number, paddleWidth: number, yBall: number, leftPlayer: GamePlayer, paddleHeight: number, xSpeed: number, ySpeed: number, canvaWidth: number, rightPlayer: GamePlayer) {
    // if (xBall - ballRadius <= paddleWidth && yBall >= leftPlayer.y && yBall <= leftPlayer.y + paddleHeight) {
    if (this.ballIsTouchingLeftPaddle(xBall, ballRadius, paddleWidth, yBall, leftPlayer, paddleHeight)) {
      xSpeed = -xSpeed;
      // Pour donner un effet à la balle en fonction de l'endroit où elle touche la palette
      let deltaY = yBall - ((leftPlayer.y + paddleHeight) / 2);
      ySpeed = deltaY * 0.35;
    }

    //Touche pad du joueur de droite
    // if (xBall + ballRadius >= canvaWidth - paddleWidth && yBall >= rightPlayer.y && yBall <= rightPlayer.y + paddleHeight) {
    if (this.ballIsTouchingRightPaddle(xBall, ballRadius, paddleWidth, yBall, rightPlayer, paddleHeight, canvaWidth)) {
      xSpeed = -xSpeed;
      // Pour donner un effet à la balle en fonction de l'endroit où elle touche la palette
      let deltaY = yBall - ((rightPlayer.y + paddleHeight) / 2);
      ySpeed = deltaY * 0.35;
    }
    return { xSpeed, ySpeed };
  }

  private handleBouncingOnWall(ballRadius: number, yBall: number, ySpeed: number, canvaHeight: number, xBall: number, xSpeed: number, canvaWidth: number) {
    if (yBall + ySpeed + ballRadius > canvaHeight || yBall - ballRadius + ySpeed < 0) {
      ySpeed = -ySpeed;
    }


    /*if (xBall + ballRadius + xSpeed > canvaWidth || xBall + ballRadius + xSpeed < 0) {
      xSpeed = -xSpeed;
    }*/
    return { ySpeed, xSpeed };
  }

  private handleScore(xBall: number, ballRadius: number, canvaWidth: number, leftPlayer: GamePlayer, yBall: number, room: string, rightPlayer: GamePlayer, paddleWidth: number, xSpeed: number, ySpeed: number, victoryPoints: number) {
    if (xBall + ballRadius >= canvaWidth) {
      leftPlayer.score += 1;
      xBall = 400;
      yBall = 200;
      xSpeed = 3;
      ySpeed = 3;
      this.server.to(room).emit('scoring', {
        name_left: leftPlayer.name,
        score_left: leftPlayer.score,
        name_right: rightPlayer.name,
        score_right: rightPlayer.score,
      });
      //console.log("point to the left")
      //console.log(leftPlayer)
      //console.log(rightPlayer)
    } else if (xBall < paddleWidth) {
      rightPlayer.score += 1;
      xBall = 400;
      yBall = 200;
      xSpeed = -3;
      ySpeed = -3;
      this.server.to(room).emit('scoring', {
        name_left: leftPlayer.name,
        score_left: leftPlayer.score,
        name_right: rightPlayer.name,
        score_right: rightPlayer.score,
      });
      //("point to the right")
      //console.log(leftPlayer)
      //console.log(rightPlayer)
    }
    const end_game = (leftPlayer.score >= victoryPoints || rightPlayer.score >= victoryPoints)
    return { xBall, yBall, xSpeed, ySpeed, end_game };
  }

  getPlayerRightAndPlayerLeft(room: string): { right: string, left: string } {
    const mapPlayer = this.roomStoreService.getMapPong();
    const playerOne = mapPlayer.get(room).map.get(mapPlayer.get(room).players[0])
    const playerTwo = mapPlayer.get(room).map.get(mapPlayer.get(room).players[1])

    return {
      right: playerOne.side === "RIGHT" ? playerOne.name : playerTwo.name,
      left: playerOne.side === "RIGHT" ? playerTwo.name : playerOne.name
    }
  }
}