import MGameWatch from '../images/MGameWatch.png';
import { useNavigate } from 'react-router-dom';
import { backRequest, getUser } from '../api/queries';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '../context/UserContext';
import { useEffect } from 'react';
import Cookies from 'js-cookie';


function NavBar() {
  const navigate = useNavigate();
  const { user, setUser, disconnectUser } = useUser();

  const goToPage = async (path: string) => {
    const elem = document.activeElement as HTMLElement;

    if (elem) {
      elem?.blur();
    }
    navigate(path);
  };

  const handlelogout = async () => {
    const ret = await backRequest('auth/logout', 'POST');

    if (ret.isOk) {
      disconnectUser()
      // Cookies.remove("jwtToken");
      // setUser((prevUser) => ({...prevUser, isAuthenticated:false}))
      // console.log("\n\n\nhandout logout user : ", user);
      navigate('/login');
    } else {
      console.log('error in navBar: ', ret.message);
    }
  }

  return (
    <div className="navbar h-70 bg-gradient-to-b from-navbar to-white">
      <div className="flex-1">
        <button
          className="btn btn-ghost text-orangeNG Pong normal-case text-2xl font-display"
          onClick={() => goToPage('/')}
        >
          PONG
        </button>
      </div>
      <button
        className="mr-4"
        onClick={() => goToPage('/leaderboard')}
      >
        <svg
          width="35px"
          height="35px"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <path
            d="M15 21H9V12.6C9 12.2686 9.26863 12 9.6 12H14.4C14.7314 12 15 12.2686 15 12.6V21Z"
            stroke="#E07A5F"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20.4 21H15V18.1C15 17.7686 15.2686 17.5 15.6 17.5H20.4C20.7314 17.5 21 17.7686 21 18.1V20.4C21 20.7314 20.7314 21 20.4 21Z"
            stroke="#E07A5F"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 21V16.1C9 15.7686 8.73137 15.5 8.4 15.5H3.6C3.26863 15.5 3 15.7686 3 16.1V20.4C3 20.7314 3.26863 21 3.6 21H9Z"
            stroke="#E07A5F"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.8056 5.11325L11.7147 3.1856C11.8314 2.93813 12.1686 2.93813 12.2853 3.1856L13.1944 5.11325L15.2275 5.42427C15.4884 5.46418 15.5923 5.79977 15.4035 5.99229L13.9326 7.4917L14.2797 9.60999C14.3243 9.88202 14.0515 10.0895 13.8181 9.96099L12 8.96031L10.1819 9.96099C9.94851 10.0895 9.67568 9.88202 9.72026 9.60999L10.0674 7.4917L8.59651 5.99229C8.40766 5.79977 8.51163 5.46418 8.77248 5.42427L10.8056 5.11325Z"
            stroke="#E07A5F"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="flex-none gap-2">
        <span className="font-display text-orangeNG text-xs pseudo mr-3">
          {user?.pseudo}
        </span>
        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="btn btn-ghost btn-circle avatar online drop-shadow-md mr-5 bg-white"
          >
            <div className="w-10 rounded-full">
              <img src={user?.avatar} />
            </div>
          </label>
          <ul
            tabIndex={0}
            className="mt-3 z-[1] p-2 menu menu-sm dropdown-content bg-white rounded-box w-52"
          >
            <li>
              <button
                className="font-display text-orangeNG hover:text-orangeNG"
                onClick={() => goToPage('/settings')}
              >
                Settings
              </button>
            </li>
            <li>
              <button
                className="font-display text-orangeNG hover:text-orangeNG"
                onClick={() => handlelogout()}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
