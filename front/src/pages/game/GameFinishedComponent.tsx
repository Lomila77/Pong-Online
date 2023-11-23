import { useEffect, useState } from 'react';
import { Player } from './Game';

interface GameFinishedComponentProperties {
    winner: Player;
    loser: Player;
    winnerScore: number;
    loserScore: number;
}

type WinnerNameColor = 'text-green-300' | 'text-green-500';

function GameFinishedComponent({
    winner,
    loser,
    winnerScore,
    loserScore,
}: GameFinishedComponentProperties) {

    const [winnerNameColor, setWinnerNameColor] = useState<WinnerNameColor>('text-green-300');

    // Interval to change the color of the winner name
    useEffect(() => {
        const interval = setInterval(() => {
            setWinnerNameColor((prevColor) => {
                if (prevColor === 'text-green-300')
                    return 'text-green-500';
                if (prevColor === 'text-green-500')
                    return 'text-green-300';
                return 'text-green-300';
            });
        }, 100);
        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <>
            <div className="flex flex-col">
                <div className="flex flex-col items-center justify-center">
                    <h1 className={`text-5xl col-span-2 text-center font-display text-green-400 NewGame mb-32 ml-16 mr-16 ${winnerNameColor}`}>
                        {winner.firstName} WON with {winnerScore} pts
                    </h1>
                    <p className='text-5xl font-display text-red-400 NewGame mb-32'>
                        {loser.firstName} lost with {loserScore} pts
                    </p>
                </div>
            </div>
        </>
    );
}

export default GameFinishedComponent;