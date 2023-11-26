export interface User {
	pseudo: string;
	avatar: any;
	isF2Active: boolean;
	friends?: string[];
  }

export interface Channel {
	MyDms: string[];
	MyChannels: string[];
	ChannelsToJoin: string[];
}

export interface frontReqInterface {
	pseudo?: string;
	avatar?: any;
	isF2Active?: boolean;
	fortytwo_id?: string;
}

export interface backResInterface {
	pseudo?: string;
	isOk?: boolean;
	message?: string;
	avatar?: any;
	isF2Active?: boolean;
	fortytwo_id?: string;
	friends?: string[];
	allUser?: User[];
	channels?: Channel;
	isAuthenticated?: boolean;
  }
