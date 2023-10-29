import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  pseudo: string;

  @IsBoolean()
  @IsNotEmpty()
  isF2Active: boolean;

  @IsString()
  @IsNotEmpty()
  avatar: string;

  id: number;
	login: string;
  email: string;
  image: {link: string};
}
