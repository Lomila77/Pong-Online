import { v4 as uuidv4 } from 'uuid';
import { RoomStoreService } from '../store/room-store.service';

interface Room {
    name: string;
}

export class CreatePublicGame {

    constructor(private roomStoreService: RoomStoreService) { }

    async handle(): Promise<Room> {
        // on regarde si i a déjà une partie ouvert

        const roomNames = Array.from(this.roomStoreService.getMapPlayer().keys())
        let roomAvailable: string | null = null;
        roomNames.forEach((roomName) => {
            const hasOnePlayer = this.roomStoreService.getMapPlayer().get(roomName).players.length != 2;
            if (hasOnePlayer) {
                roomAvailable = roomName;
                return;
            }
        })

        if (roomAvailable !== null) {
            return { name: roomAvailable };
        }

        const uuid = this.generateUuid();
        this.roomStoreService.getMapPlayer().set(uuid, {
            "map": new Map(), "players": [], "game": {
                xBall: 200,
                yBall: 200,
                xSpeed: 1.5,
                ySpeed: 1.5,
                canvasWidth: 800,
                canvasHeight: 400,
                leftPaddleWidth: 60,
                rightPaddleWidth: 60,
                victoryPoints: 5,
                ballRadius: 10
            }
        })

        return { name: uuid };
    }

    generateUuid(): string {
        return uuidv4();
    }
}