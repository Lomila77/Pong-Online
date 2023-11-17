import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEmail, IsArray, IsNumber, isNotEmpty, isNumber } from 'class-validator';

export class ChannelMessageSendDto {
	@IsNotEmpty()
	@IsNumber()
	chatId: number;

	@IsNotEmpty()
	@IsString()
	public msg: string = "";
}


export class DmMsgSend {
	@IsNotEmpty()
	@IsString()
	public target: string = "";

	@IsNotEmpty()
	@IsString()
	public msg: string = "";
}