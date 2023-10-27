import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  pseudo: string;

  @IsBoolean()
  @IsNotEmpty()
  isF2Active: boolean;
}
