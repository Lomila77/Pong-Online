import NavBar from '../components/NavBar';
import Buildings from '../images/BUILDINGCLOUDS.png';
import Nuage from '../images/Nuage.svg';
import AnimTombi from '../images/AnimTombi.json';
import { useUser } from '../context/UserContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user)
      navigate("/login");
  }, [user]);

  return (
    <div className="flex items-stretch">
      <div className="basis-1/2 grow w-14">
        <img
          className="object-scale-down Buildings"
          src={Buildings}
          width="870"
        />
      </div>
      <button className="basis-1/3 self-center text-6xl mb-40 mr-36 font-display text-orangeNG NewGame">
        NEW GAME
      </button>
    </div>
  );
}

export default Home;
