import { Injectable } from '@nestjs/common';

export interface GamePlayer {
    name: string;
    side: string; 
    x: number;
    y: number;
    score: number;
  }
  
  export interface BallMoveEvent {
    x: number;
    y: number;
  }
  
  export interface Game {
    xBall: number; 
    yBall: number; 
    xSpeed: number; 
    ySpeed: number; 
    victoryPoints: number;
    ballRadius: number;
    canvasWidth: number;
    canvasHeight: number;
    leftPaddleWidth: number;
    rightPaddleWidth: number;
  }


@Injectable()
export class RoomStoreService {
    mapPlayer: Map<string, {
        "map": Map<string, GamePlayer>, 
        "players": string[], 
        "game": Game
      }> = new Map();
    //   mapPlayer["room1"] = {"map": ["Player1"] => {name: "Player1", x: 0, y: 112}, ["Player2"] => {name: "Player2", x: 800, y: 120}, {"players": ["Player1", "Player2"]}}

    getMapPlayer(): Map<string, {
        "map": Map<string, GamePlayer>, 
        "players": string[], 
        "game": Game
    }> {
        return this.mapPlayer;
    }

}