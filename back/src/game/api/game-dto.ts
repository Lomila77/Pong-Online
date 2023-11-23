import { IsNumber } from 'class-validator';

export class GameDto {
  @IsNumber()
  xSpeed: number;

  @IsNumber()
  ySpeed: number;

  @IsNumber()
  victoryPoint: number;

  @IsNumber()
  ballRadius: number;
}

export class GameResponse {
    roomName: string
}