import { Injectable } from '@nestjs/common'
import { PrismaService } from "../prisma/prisma.service";
import {AuthDto} from "./dto";
import * as argon from 'argon2'

@Injectable({})
export class AuthService{
    constructor(private prisma: PrismaService) {
    }

    async signup(dto: AuthDto) {
        // generate the hash password
        const hash = await argon.hash(dto.password);
        // save user in db
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hash,
            },
        })
        delete user.password;
        // return the save user
        return user;
    }

    signgin() {
        return { msg: 'I have signed in' }
    }
}