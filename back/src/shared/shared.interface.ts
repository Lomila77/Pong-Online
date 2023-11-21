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
}

export interface backResInterface {
	pseudo?: string;
	isOk?: boolean;
	message?: string;
	avatar?: any;
	isF2Active?: boolean;
	friends?: string[];
	allUser?: User[];
	channels?: string[];
  }
