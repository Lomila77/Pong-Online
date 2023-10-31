import MGameWatch from '../images/MGameWatch.png';
import { useNavigate } from 'react-router-dom';

function NavBar() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  }

  return (
    <div className="navbar bg-gradient-to-b from-navbar to-white">
      <div className="flex-1">
        <button className="btn btn-ghost text-orangeNG Pong normal-case text-2xl font-display"
        onClick={handleClick}>
          PONG
        </button>
      </div>
      <div className="flex-none gap-2">
      <span className="font-display text-orangeNG text-xs pseudo mr-3">Pitouch</span>
        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="btn btn-ghost btn-circle avatar online ring ring-white drop-shadow-md ring-offset-base-100 mr-5"
          >
            <div className="w-10 rounded-full">
              <img src={MGameWatch} />
            </div>
          </label>
          
          <ul
            tabIndex={0}
            className="mt-3 z-[1] p-2 menu menu-sm dropdown-content bg-white rounded-box w-52"
          >
            <li>
              <a className="justify-between font-display text-orangeNG hover:text-orangeNG">
                Profile
              </a>
            </li>
            <li>
              <a className="font-display text-orangeNG hover:text-orangeNG">Settings</a>
            </li>
            <li>
              <a className="font-display text-orangeNG hover:text-orangeNG">Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NavBar;