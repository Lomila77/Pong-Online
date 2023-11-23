import React, {  useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameService } from '../../api/game.service';

// to do
// test api =>
// given : user create a private game
// when : user join the game
// then : user is redirected to the game page
// route doesn't exist in api => remy must create it

function CreateGame() {

  const [ballSpeedY, setBallSpeedY] = useState<number>(2);
  const [ballSpeedX, setBallSpeedX] = useState<number>(2);
  const [ballSize, setBallSize] = useState<number>(2);
  const [victoryPoint, setVictoryPoint] = useState<number>(5);
  const navigate = useNavigate();
  const handleSpeedYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBallSpeedY(Number(e.target.value));
  };

  const handleSpeedXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBallSpeedX(Number(e.target.value));
  }

  const handleBallSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBallSize(Number(e.target.value));
  }

  const handleVictoryPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVictoryPoint(Number(e.target.value));
  }

  const newPrivateGame = () => {
    GameService.createPrivateGame(ballSpeedY, ballSpeedX, ballSize, victoryPoint).then((game) => {
      navigate(`/game/${game.id}`);
    }).catch((err) => {
      console.log(err);
    })
  };

  return (
    <>
      <div className="card-side card-bordered border-4 border-white bg-[#fbfaf3] shadow-xl p-12 flex flex-col items-center max-w-lg mx-auto mt-4">
    <span className="font-display text-orangeNG text-3xl mb-4">
        creating game
      </span>
        <div className='max-w-sm mx-auto p-4'>
          <div className='mb-4'>


            <label htmlFor='ballSpeedY' className='block text-gray-700 text-sm font-bold mb-2'>
                  <span className='label-text text-base'>
                      ball speed y: {ballSpeedY}
                  </span>
            </label>
            <input
              type='range'
              id='ballSpeedY'
              min='1'
              max='3'
              value={ballSpeedY}
              onChange={handleSpeedYChange}
              className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
            />
          </div>
          <div className='mb-4'>
            <label htmlFor='paddleSpeed' className='block text-gray-700 text-sm font-bold mb-2'>
                  <span className='label-text text-base'>
                      ball speed X: {ballSpeedX}
                  </span>
            </label>
            <input
              type='range'
              id='ball speed X'
              min='1'
              max='3'
              value={ballSpeedX}
              onChange={handleSpeedXChange}
              className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
            />
          </div>g
          <div className='mb-4'>
            <label htmlFor='ballSize' className='block text-gray-700 text-sm font-bold mb-2'>
                  <span className='label-text text-base'>
                      paddleSpeed: {ballSize}
                  </span>
            </label>
            <input
              type='range'
              id='ballSize'
              min='1'
              max='3'
              value={ballSize}
              onChange={handleBallSizeChange}
              className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
            />
          </div>
          <div className='mb-4'>
            <label htmlFor='ballSize' className='block text-gray-700 text-sm font-bold mb-2'>
                  <span className='label-text text-base'>
                      victory points: {victoryPoint}
                  </span>
            </label>
            <input
              type='range'
              id='rounds'
              min='1'
              max='10'
              value={victoryPoint}
              onChange={handleVictoryPointsChange}
              className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
            />
          </div>
          <div>
            <button
              className="btn btn-secondary btn-block font-display mt-6 text-white"
              onClick={newPrivateGame}>
              Create game
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

export default CreateGame;