import React, { useState } from 'react';
import { backRequestTest } from '../api/queries';
import CardLeader from './CardLeader';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import ProfileModal from './ProfileComp';

const LeaderComp: React.FC = () => {
  const { data = { users: [] } } = useQuery({
    queryKey: ['getLeaderboard'],
    queryFn: () => backRequestTest('leaderboard', 'GET'),
  });

  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const userToDisplay = data.users[selectedUserIndex];
  return (
    <>
      <div className="card-side card-bordered border-4 border-white bg-[#fbfaf3] shadow-xl p-12">
        <span className="font-display text-orangeNG text-3xl">
          Leaderboard
        </span>
        <div className="pt-7 grid gap-y-5">
          {data.users.map((user: any, index: any) => (
            <CardLeader
              key={index}
              name={user.name}
              rank={user.rank}
              numberOfWin={user.numberOfWin}
              onClickUser={() => setSelectedUserIndex(index)}
            />
          ))}
        </div>
      </div>

      <dialog id="my_modal_3" className="modal">
        <div className="modal-box shrink w-64 card card-bordered border-white border-4">
          <form method="dialog">
            <button className="btn btn-sm btn-circle text-bleuPseudo btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <div>
            <ProfileModal user={userToDisplay}/>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default LeaderComp;
