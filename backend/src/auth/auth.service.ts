import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {JwtService} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";

@Injectable({})
export class AuthService{
    constructor(private prisma: PrismaService,
                private jwt: JwtService,
                private config: ConfigService) {
    }

    async signup(dto: AuthDto) {
        // generate the hash password
        const hash = await argon.hash(dto.password);
        // save user in db
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    password: hash,
                },
            })
            // return the save user
            return this.signToken(user.fortytwo_id, user.email);
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {//for duplicate fields
                    throw new ForbiddenException('Credentials taken')
                }
            }
            throw error; // Si ce n'est pas prisma on renvoie l'erreur
        }
    }

    async signgin(dto: AuthDto) {
        // find user by email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        })
        // if user does not exist throw exception
        if (!user)
            throw new ForbiddenException('Credential incorrect');
        // compare password
        const pwMatches = await argon.verify(user.password, dto.password);
        // if password incorrect throw excpetion
        if (!pwMatches)
            throw new ForbiddenException('Credential incorrect')
        // send back user (everything is ok)
        return this.signToken(user.fortytwo_id, user.email);
    }

    async signToken(userFortytwo_id: number, email: string): Promise<{ access_token: string }> {
        const payload = {
            sub: userFortytwo_id,
            email,
        }
        const secret = this.config.get('JWT_SECRET')
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: secret,
        });

        return {
            access_token: token,
        };
    }
}