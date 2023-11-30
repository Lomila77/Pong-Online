export interface User {
	pseudo: string;
	avatar: any;
	isF2Active: boolean;
	friends?: string[];
  }

export interface frontReqInterface {
	pseudo?: string;
	avatar?: any;
	isF2Active?: boolean;
	fortytwo_id?: string;
}

export interface IChannel {
	id: number,
	name: string,
  }

export interface IChannels{
	MyDms: IChannel[];
	MyChannels: IChannel[];
	ChannelsToJoin : IChannel[];
  }

  export interface backResInterface {
	pseudo?: string;
	isOk?: boolean;
	message?: string;
	avatar?: any;
	isF2Active?: boolean;
	fortytwo_id?: string;
	friends?: string[];
	allUser?: User[]
	isAuthenticated?: boolean;
	channels?: IChannels;
	xp?: number;
	data?: any;
  }
