import Buildings from '../images/BUILDINGCLOUDS.png'
import { useUser } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import FireGif from '../components/FireGif'

function Home() {
  const { user } = useUser()
  const navigate = useNavigate()

  // useEffect(() => {
  //   if (!user)
  //     navigate("/login");
  // }, [user]);

  const renderFire = (
    <>
      <img className="Buildings" src={Buildings} />
      <div className="Fire">
        <FireGif />
      </div>
    </>
  )

  return (
    <div className="flex items-stretch Parent relative flex-col-reverse md:flex-row ">
      <div className="sm:block md:hidden">{renderFire}</div>
      <div className="hidden md:block flex flex-1 items-end relative">
        {renderFire}
      </div>
      <div className="flex flex-1 items-center justify-center sm:py-2 sm:px-5">
        <button className="text-6xl font-display text-orangeNG hover:text-7xl ease-i-out duration-300 NewGame mb-32">
          NEW GAME
        </button>
      </div>
    </div>
  )
}

export default Home
