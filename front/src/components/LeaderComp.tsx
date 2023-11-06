import React from 'react';
import CardLeader from './CardLeader';

const LeaderComp: React.FC = () => {
  return (
    <>
      <div>
        <span className="font-display text-orangeNG text-3xl">
          Leaderboard
        </span>
        <div className="pt-7 ">
          <CardLeader />
        </div>
      </div>
    </>
  );
};

export default LeaderComp;
