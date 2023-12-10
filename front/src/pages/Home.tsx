import React, { useEffect } from "react";
import Buildings from '../images/BUILDINGCLOUDS.png';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import FireGif from '../components/FireGif';
import Chat from '../components/Chat';
import { GameService } from '../api/game.service';

function Home() {
    const { user } = useUser();
    const navigate = useNavigate();

//    useEffect(() => {
//      if (!user)
//        navigate("/login");
//    }, [user]);

    const renderFireAndBuilding = (
        <div className="relative FireBuilding">
            <img src={Buildings} alt="Building" className="" />
            {/* <FireGif className="Fire"/> */}
        </div>
    );

    // const renderFire = (
    //     <>
    //       <img className="Buildings" src={Buildings} />
    //       <div className="Fire">
    //         <FireGif />
    //       </div>
    //     </>
    //   )

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
        <div className='flex relative flex-col-reverse md:flex-row lg:flex-row xl:flex-row 2xl:flex-row h-full'>
            <div className='flex flex-col flex-1 items-center justify-center py-2 px-5 bg-red'>
                <div className='renderFireBuilding'>
                    {renderFireAndBuilding}
                </div>
            </div>
            <div className='flex flex-col flex-1 items-center justify-center py-2 px-5 bg-red'>
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

// return (
//     <div className="flex items-stretch Parent relative flex-col-reverse md:flex-row ">
//       <div className="sm:block md:hidden">{renderFire}</div>
//       <div className="hidden md:block flex flex-1 items-end relative">
//         {renderFire}
//       </div>
//       <div className="flex flex-1 items-center justify-center sm:py-2 sm:px-5">
//         <button className="text-6xl font-display text-orangeNG hover:text-7xl ease-i-out duration-300 NewGame mb-32">
//           NEW GAME
//         </button>
//       </div>
//       <div>
//           <Chat />
//       </div>
//     </div>
//   )
// }

export default Home;
