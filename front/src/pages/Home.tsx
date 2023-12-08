import React, { useEffect } from "react";
import Buildings from '../images/BUILDINGCLOUDS.png'
import { useUser } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import FireGif from '../components/FireGif'
import Chat from "../components/Chat";
import { GameService } from '../api/game.service';

function Home() {
    const { user } = useUser();
    const navigate = useNavigate();

    // useEffect(() => {
    //   if (!user)
    //     navigate("/login");
    // }, [user]);

    const renderFire = (
        <>
            <img className="Buildings" src={Buildings} />
            <div className="Fir‰e">
                <FireGif />
            </div>
        </>
    )

    const newGame = () => {
        GameService.createOrJoinGame().then((game) => {
            navigate(`/game/${game.id}`);
        }).catch((err) => {
            console.log(err);
        });
    };

    const newPrivateGame = () => {
        navigate(`/game/create`);
    };

    return (
        <div className='flex items-stretch Parent relative flex-col-reverse md:flex-row '>
            <div className='sm:block md:hidden'>{renderFire}</div>
            <div className='hidden md:block flex flex-1 items-end relative'>
                {renderFire}
            </div>
            <div className='flex flex-col flex-1 items-center justify-center py-2 px-5'>
                <button
                    className='text-6xl font-display text-orangeNG hover:text-7xl ease-in-out duration-300 mb-10'
                    onClick={newGame}>
                    NEW GAME
                </button>

                <button
                    className='text-2xl font-display text-orangeNG hover:text-3xl ease-in-out duration-300 mb-4'
                    onClick={newPrivateGame}>
                    PRIVATE GAME
                </button>
            </div>

            <div>
                <Chat />
            </div>
        </div>
    );
}

export default Home
