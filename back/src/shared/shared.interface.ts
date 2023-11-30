export interface User {
	pseudo: string;
	avatar: any;
	isF2Active: boolean;
	friends?: number[];
	win?: number;
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
	isFriend?: boolean;
	friends?: number[];
	allUser?: User[];
	isAuthenticated?: boolean;
	channels?: IChannels;
	xp?: number;
	win?: number;
	data?: any;
  }
