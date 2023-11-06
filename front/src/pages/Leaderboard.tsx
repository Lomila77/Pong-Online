import LeaderComp from '../components/LeaderComp';

function Leaderboard() {
  return (
    <>
      <div className="flex justify-center">
        <div className="barre-verticale"></div>
        <div className="p-12">
          <LeaderComp />
        </div>
        <div className="barre-verticale"></div>
      </div>
    </>
  );
}

export default Leaderboard;
