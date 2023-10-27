import NavBar from './NavBar';
import Buildings from '../images/Buildings.svg'

function Home() {
  return (
    <>
      <div>
        <NavBar />
      </div>
      <div>
        <img src={Buildings} height="50" width="750"/>
      </div>
    </>
  );
}

export default Home;
