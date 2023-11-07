import React from 'react';
import CardLeader from './CardLeader';

const LeaderComp: React.FC = () => {
  return (
    <div className="card-side card-bordered border-4 border-white bg-[#fbfaf3] shadow-xl p-12">
      <span className="font-display text-orangeNG text-3xl">
        Leaderboard
      </span>
      <div className="pt-7">
        <CardLeader />
      </div>
    </div>
  );
};

export default LeaderComp;
