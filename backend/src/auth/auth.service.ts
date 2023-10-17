import { Injectable } from '@nestjs/common'

@Injectable({})
export class AuthService{
    signgin() {
        return { msg: 'I have signed in' }
    }

    signup() {
        return { msg: 'I have sign up' }
    }
}