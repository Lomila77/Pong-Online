import {useUser} from "../context/UserContext";
import {User} from "../api/queries";
import React from "react";
import CardHistory from "./CardHistory";
import { useQuery } from '@tanstack/react-query';
import {backRequest } from '../api/queries';

const GameHistory: React.FC = () => {
    const {user, setUser} = useUser();
    if (!user)
        return;

    const { data: gameResults = [] } = useQuery({
        queryKey: ['getGameResults'],
        queryFn: () => backRequest('game/users/me', 'GET'),
      });

      console.log('Game Results:', gameResults);

    return (
        <div className="card-side card-bordered border-4 border-white bg-[#fbfaf3] shadow-xl p-12">
        <span className="font-display text-orangeNG text-3xl">
          History
        </span>
            <div className="pt-7 grid gap-y-5">
                {//user.history.map((history, index: number) => (
                //    <CardHistory me={user.pseudo}
                //                 rival={history.rival}
                //                 rivalScore={history.rivalScore}
                //                 meScore={history.myScore}
                //                 key={index}
                //    />
                //))
                }
            </div>
        </div>
    );
}

export default GameHistory;