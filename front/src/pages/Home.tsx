import Buildings from '../images/BUILDINGCLOUDS.png';
import { useUser } from '../context/UserContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FireGif from "../components/FireGif"

function Home() {
  const { user } = useUser();
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (!user)
  //     navigate("/login");
  // }, [user]);

  return (
    <div className="flex items-stretch Parent">
      <div className="basis-1/2 grow w-14">
        <img
          className="object-scale-down Buildings"
          src={Buildings}
          width="870"
        />
      </div>
      <button className="basis-1/3 self-center text-6xl mb-36 mr-36 font-display text-orangeNG hover:text-7xl ease-i-out duration-300 NewGame">
        NEW GAME
      </button>
      {/* <div className="enfant2">
        <FireGif />
      </div> */}
    </div>
  );
}

export default Home;
