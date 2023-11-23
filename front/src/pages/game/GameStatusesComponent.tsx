import { FinishedGameState, GameStatus, Player } from './Game';
import GameFinishedComponent from './GameFinishedComponent';
import { ThreeDots } from 'react-loader-spinner'

interface GameStatusProperties {
    gameStatus: GameStatus;
    leftPlayer: Player | null;
    rightPlayer: Player | null;
    finishedGameState: FinishedGameState | null;
}

function GameStatusesComponent({
    gameStatus, leftPlayer, rightPlayer, finishedGameState,
}: GameStatusProperties) {
    return (
        <>
            {
                gameStatus === GameStatus.WAITING_FOR_PLAYERS ? (
                    <>
                        <p className='text-4xl font-display text-black NewGame mb-32'>
                            WAITING FOR OPPONENT
                        </p>
                        {/*    3 dots loading */}
                        <ThreeDots
                            color='#000000'
                            height={100}
                            width={100}
                        />
                    </>
                ) : null
            }
            {
                gameStatus === GameStatus.IN_PROGRESS ? (
                    <div className='flex flex-row items-center justify-center'>
                        <p className='text-4xl font-display text-green-300 ease-i-out duration-300 NewGame mb-32'>
                            {leftPlayer?.firstName}
                        </p>
                        <p className='text-3xl font-display text-orangeNG ease-i-out duration-300 NewGame mb-32 ml-16 mr-16'>
                            VS
                        </p>
                        <p className='text-4xl font-display text-green-300 ease-i-out duration-300 NewGame mb-32'>
                            {rightPlayer?.firstName}
                        </p>
                    </div>
                ) : null
            }
            {
                gameStatus === GameStatus.FINISHED ? (
                    <GameFinishedComponent
                        winner={finishedGameState!.winner!}
                        loser={finishedGameState!.loser!}
                        winnerScore={finishedGameState!.scoreLeft}
                        loserScore={finishedGameState!.scoreRight}
                    />
                ) : null
            }
        </>
    );
}

export default GameStatusesComponent;
