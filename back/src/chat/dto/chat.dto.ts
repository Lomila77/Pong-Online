import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEmail, IsArray, IsNumber } from 'class-validator';
import { Tag } from '../chat.type';

export class ChannelCreateDto {
  @IsString()
  @IsOptional()
  chatName: string;

  @IsNumber()
  @IsOptional()
  chanId: number;

  @IsBoolean()
  @IsOptional()
  isPrivate: boolean;

  @IsBoolean()
  @IsOptional()
  isPassword: boolean;

  @IsString()
  @IsOptional()
  Password: string;

  @IsArray()
  @IsOptional()
  members: Array<Tag>

  @IsString()
  @IsOptional()
  pseudo2: string;
}

export class sendMsgDto {
  @IsEmail()
  @IsOptional()
  email: string

  @IsNumber()
  @IsNotEmpty()
  chatId: number

  @IsString()
  @IsNotEmpty()
  msg: string

}

export class DmDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  @IsNotEmpty()
  targetId: number;

}