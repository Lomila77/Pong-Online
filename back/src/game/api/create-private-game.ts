import { v4 as uuidv4 } from 'uuid';
import { RoomStoreService } from '../store/room-store.service';
import { GameDto } from './game-dto';

interface Room {
    name: string;
}



export class CreatePrivateGame {

    constructor(private roomStoreService: RoomStoreService) { }

    async handle(dto: GameDto): Promise<Room> {
        const ballXSpeed = [1.5, 3, 4.5]
        const ballYSpeed = [1.5, 3, 4.5]

        const ballRadius = [10, 20, 30]

        const uuid = this.generateUuid();
        this.roomStoreService.getMapPlayer().set(uuid, {
            "map": new Map(), "players": [], "game": {
                xBall: 200,
                yBall: 200,
                xSpeed: ballXSpeed[dto.xSpeed],
                ySpeed: ballYSpeed[dto.ySpeed],
                victoryPoints: dto.victoryPoint,
                ballRadius: ballRadius[dto.ballRadius],
                canvasWidth: 800,
                canvasHeight: 400,
                leftPaddleWidth: 60,
                rightPaddleWidth: 60
            }
        })

        return { name: uuid };
    }

    generateUuid(): string {
        return uuidv4();
    }
}