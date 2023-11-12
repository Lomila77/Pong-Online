export interface User {
	pseudo: string;
	avatar: any;
	isF2Active: boolean;
	friends?: string[];
  }

export interface backResInterface {
	pseudo?: string;
	isOk?: boolean;
	avatar?: any;
	isF2Active?: boolean;
	friends?: string[];
	allUser?: User[]
  }
