import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BallMoveEvent, GamePlayer, RoomStoreService } from '../store/room-store.service';
import { GameService } from '../api/game-service';
import { ChatGateway } from '../../chat/chat.gateway';
import { Inject, forwardRef } from '@nestjs/common';
import * as jwt from "jsonwebtoken";
import {PrismaClient} from "@prisma/client";


@WebSocketGateway({ namespace: '/events', cors: true })
export class EventsGateway {

  paddleWidth: number;
  paddleHeight: number;
  paddleGapWithWall: number;
  canvasHeight: number;
  canvasWidth: number;
  ballRadius: number;

  constructor(
      private roomStoreService: RoomStoreService,
      private gameService: GameService,
      private readonly prisma: PrismaClient,
      @Inject(forwardRef(() => ChatGateway))
      private chatGateway: ChatGateway)
  {
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
  async handleJoinRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket): Promise<any> {
    console.log("we called joinRoom in back");
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        console.log('Token is missing');
        client.disconnect();
        return;
      }

      // Décoder le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (typeof decoded === 'object' && 'sub' in decoded) {
        const userId = decoded.sub;


        const user = await this.prisma.user.findUnique({
           where: {
            fortytwo_id: Number(userId),
          },
          select: {
            fortytwo_id: true,
            pseudo: true,
          }
        })
        console.log("client " + client + " is trying to join a room...");

        // this.clients[client.id] = user;
        const mapPong = this.roomStoreService.getMapPong();

        // si la room existe pas encore
        if (!mapPong.get(data.room)) {
          client.emit('gameDoesNotExist', {})
          return
        }
        // on associe le user au socket
        client.data.username = user.pseudo;
        client.data.fortytwo_id = user.fortytwo_id;
        client.data.room = data.room; //TODO: enlever username de data envoyé du front
        // on add le user dans la room
        client.join(data.room);
        console.log("client " + client + " has joined room " + data.room);
        // si déjà deux joueurs dans les players
        if (mapPong.get(data.room).players.length === 2) {
          if (!mapPong.get(data.room).map.get(user.pseudo)) {
            // déjà 2 joueurs dans la partie mais pas le joueur qui join
            return
          }

        // le joueur qui join était déjà dans la partie
          const players = this.getPlayerRightAndPlayerLeft(data.room);
          client.emit('gameData', {
            gameData: mapPong.get(data.room).game,
            playerRight: players.right,
            playerLeft: players.left
          })
          client.emit('yourPosition', {
            y: mapPong.get(data.room).map.get(user.pseudo).y,
            side: mapPong.get(data.room).map.get(user.pseudo).side
          })
          return {event: 'joinedRoom', data: `Joined room: ${data.room}`};
        }

    const userId = await this.gameService.findUserIdByUsername(client.data.username);
    console.log("USER ID IN GAME = ", userId);
    await this.gameService.setUserInGame(userId, true);
    await this.chatGateway.emitSignal(userId, {userId: userId}, "userGameState");
    // Pourquoi le faire une deuxieme fois ?
    //this.chatGateway.emitSignal(1, {
    //  username: client.data.username,
    //  inGame: true
    //}, "userGameState")


        // le joueur arrive dans la partie et c'est le premier
        if (!mapPong.get(data.room).map.get(user.pseudo) && mapPong.get(data.room).players.length === 0) {
          mapPong.get(data.room).map.set(user.pseudo, {
            name: user.pseudo,
            x: this.paddleGapWithWall,
            y: 100,
            side: "LEFT",
            score: 0
          });
          mapPong.get(data.room).players.push(user.pseudo)
          mapPong.get(data.room).players = [...new Set(mapPong.get(data.room).players)] as string[]
          client.emit('startGame', {eventName: "waiting"})
          client.emit('yourPosition', {y: mapPong.get(data.room).game.leftPaddlePositionY, side: "LEFT"})
          return {event: 'joinedRoom', data: `Joined room: ${data.room}`};
        }

        // le joueur arrive dans la partie et c'est le deuxième
        if (!mapPong.get(data.room).map[user.pseudo] && mapPong.get(data.room).players.length === 1) {
          mapPong.get(data.room).map.set(user.pseudo, {
            name: user.pseudo,
            x: this.canvasHeight - this.paddleGapWithWall,
            y: 100,
            side: "RIGHT",
            score: 0
          })
          mapPong.get(data.room).players.push(user.pseudo)
          mapPong.get(data.room).players = [...new Set(mapPong.get(data.room).players)] as string[]
          const players = this.getPlayerRightAndPlayerLeft(data.room);
          this.server.to(data.room).emit('startGame',
              {
                eventName: "start",
                playerRight: players.right,
                playerLeft: players.left,
                gameData: mapPong.get(data.room).game
              }
          );
          client.emit('yourPosition', {y: mapPong.get(data.room).game.rightPaddlePositionY, side: "RIGHT"})
          this.launchGame(data.room, client);
          return {event: 'joinedRoom', data: `Joined room: ${data.room}`};
        }

        // visiteur
        //const players = this.getPlayerRightAndPlayerLeft(data.room);
        //client.emit('gameData', { gameData: mapPong.get(data.room).game, playerRight: players.right, playerLeft: players.left })
        return {event: 'joinedRoom', data: `Joined room: ${data.room}`};
      } else {
        console.log('Invalid token');
        client.disconnect();
        return;
      }
    }
    catch (e) {
      console.log(e);
      console.log('joinRoom back error'); //TODO: remove ?
      client.disconnect();
      return;
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    client.leave(data.room);

    // TODO quand les deux se déconnecte on delete la room
    return { event: 'leftRoom', data: `Left room: ${data.room}` };
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    if (!client.data.room) {
      return
    }
    this.chatGateway.emitSignal(1, {
      username: client.data.username,
      inGame: false
    }, "userGameState")
    const room = client.data.room
    const mapPong = this.roomStoreService.getMapPong();
    if (!mapPong.get(room)) {
      return
    }
    const sockets = await this.server.in(room).allSockets();
    if (sockets.size == 0) {
      clearInterval(mapPong.get(room).game.intervalId)
      setTimeout(() => {
        mapPong.delete(room)
      }, 2000)

    }
    console.log(`Client déconnecté: ${client.id}`);
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
    if (data.direction === "UP" && !minHeight) {
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
    const isPublicGame = mapPlayer.get(room).game.private === false;
    const playerRight = player1.side === "RIGHT" ? player1 : player2;
    const playerLeft = player1.side === "LEFT" ? player1 : player2;
    const intervalId = setInterval(() => {
      const stop = this.handleGame(room, playerRight, playerLeft, client)
      if (stop === 1) {
        clearInterval(intervalId);

        // TODO: envoyer infos dans la DB
        if (isPublicGame) {

          const winner = playerLeft.score > playerRight.score ? playerLeft : playerRight;
          const looser = playerLeft.score > playerRight.score ? playerRight : playerLeft

          this.gameService.Insert(winner.name, looser.name, winner.score, looser.score)
        }
        // sendGameInfoToDB(player1, player2, time, )
        /* GAME
           end_timestamp
           winner id
           looser id
           score winner
           score looser
           uid de la partie

           USER winner
           win +1 pour winner
        */
        return;
      }
      this.notifyRoomWithBallStat(room);
    }, 1000 / 24);
  }

  notifyRoomWithBallStat(room: string) {
    const mapPlayer = this.roomStoreService.getMapPong();
    if (!mapPlayer.get(room)) {
      return
    }
    let { xBall, yBall } = mapPlayer.get(room).game;
    const ballStat: BallMoveEvent = {
      x: xBall,
      y: yBall,
    }
    this.server.to(room).emit("ballPositionEvent", ballStat);
  }


  handleGame(room: string, rightPlayer: GamePlayer, leftPlayer: GamePlayer, client: Socket) {
    const mapPong = this.roomStoreService.getMapPong();
    if (!mapPong.get(room)) {
      return
    }
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
      this.chatGateway.emitSignal(1, {
        username: client.data.username,
        inGame: false
      }, "userGameState")
      this.server.to(room).emit('endGame', {
        leftPlayer: leftPlayer,
        rightPlayer: rightPlayer,
        looser: looser,
        winner: winner,
        left_score: leftPlayer.score,
        right_score: rightPlayer.score
      })
      clearInterval(mapPong.get(room).game.intervalId)
      mapPong.delete(room)
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
    const topBorderCollision: boolean = yBall + ballRadius == leftPlayer.y && this.paddleGapWithWall <= xBall && xBall <= this.paddleGapWithWall + paddleWidth;
    const rightBoderCollision: boolean = xBall - ballRadius <= this.paddleGapWithWall + paddleWidth && yBall >= leftPlayer.y && yBall <= leftPlayer.y + paddleHeight;
    const lowerBorderCollision: boolean = yBall - ballRadius == leftPlayer.y + paddleHeight && this.paddleGapWithWall <= xBall && xBall <= this.paddleGapWithWall + paddleWidth;

    return lowerBorderCollision || topBorderCollision || rightBoderCollision;

  }

  private ballIsTouchingRightPaddle(xBall: number, ballRadius: number, paddleWidth: number, yBall: number, rightPlayer: GamePlayer, paddleHeight: number, canvaWidth: number) {
    const topBorderCollision: boolean = yBall + ballRadius == rightPlayer.y && xBall >= canvaWidth - this.paddleGapWithWall - paddleWidth && xBall <= canvaWidth - this.paddleGapWithWall;
    const leftBoderCollision: boolean = xBall + ballRadius >= canvaWidth - this.paddleGapWithWall - paddleWidth && yBall >= rightPlayer.y && yBall <= rightPlayer.y + paddleHeight;
    const lowerBorderCollision: boolean = yBall - ballRadius == rightPlayer.y + paddleHeight && canvaWidth - this.paddleGapWithWall - paddleWidth <= xBall && xBall <= canvaWidth - this.paddleGapWithWall;

    return lowerBorderCollision || topBorderCollision || leftBoderCollision;
  }

  private handleBouncingOnPaddle(xBall: number, ballRadius: number, paddleWidth: number, yBall: number, leftPlayer: GamePlayer, paddleHeight: number, xSpeed: number, ySpeed: number, canvaWidth: number, rightPlayer: GamePlayer) {
    //let xDir: number = xSpeed >= 0 ? 1 : 0;
    //let yDir: number = ySpeed >= 0? 1: 0;
    if (this.ballIsTouchingLeftPaddle(xBall, ballRadius, paddleWidth, yBall, leftPlayer, paddleHeight)) {
      const angleOfIncidence = Math.atan2(yBall - leftPlayer.y, xBall - (this.paddleGapWithWall + paddleWidth))
      const newAngle = 2 * angleOfIncidence - Math.PI;
      const speedMagnitude = Math.sqrt(xSpeed ** 2 + ySpeed ** 2);
      xSpeed = speedMagnitude * Math.cos(newAngle);
      ySpeed = speedMagnitude * Math.sin(newAngle);
      /*xSpeed = -xSpeed;
      let deltaY = yBall - (leftPlayer.y + paddleHeight / 2);
      ySpeed = deltaY * 0.1; // You can adjust the multiplier for the desired effect*/
      xBall = leftPlayer.x + paddleWidth + ballRadius; // To prevent the ball to be stuck
    }

    //Touche pad du joueur de droite
    if (this.ballIsTouchingRightPaddle(xBall, ballRadius, paddleWidth, yBall, rightPlayer, paddleHeight, canvaWidth)) {
      xSpeed = -xSpeed;
      let deltaY = yBall - (rightPlayer.y + paddleHeight / 2);
      ySpeed = deltaY * 0.1; // You can adjust the multiplier for the desired effect
      xBall = rightPlayer.x - ballRadius; //adjust the ball's position to prevent it from getting stuck inside the paddle
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