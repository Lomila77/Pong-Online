import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
import { User } from '@prisma/client';

export enum ChannelType {
  Private,
  Public,
  Direct,
  Protected,
}
export class ChatDto {
  @IsNotEmpty()
  @IsNumber()
  owner: number;

  @IsString()
  name: string;

  type: ChannelType;

  @IsString()
  password: string;

  @IsDate()
  creationDate: Date;

  @IsObject()
  user: User;

  @IsNumber()
  userFortytwo_id: number;
}
