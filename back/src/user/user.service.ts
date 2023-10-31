import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor() {}

  profil(user: User) {
    return {
      data: {
        pseudo: user.pseudo,
        avatar: user.avatar,
        isF2Active: user.isF2Active,
      },
    };
  }
}
