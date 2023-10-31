import MGameWatch from '../images/MGameWatch.png';

function NavBar() {

  return (
    <div className="navbar bg-gradient-to-b from-navbar to-white">
      <div className="flex-1">
        <a className="btn btn-ghost text-white Pong normal-case text-2xl font-display">
          PONG
        </a>
      </div>
      <div className="flex-none gap-2">
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
            className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
          >
            <li>
              <a className="justify-between font-display">
                Profile
              </a>
            </li>
            <li>
              <a className="font-display">Settings</a>
            </li>
            <li>
              <a className="font-display">Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
