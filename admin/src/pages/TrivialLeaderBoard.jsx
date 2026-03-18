import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Loader2, Award } from 'lucide-react';
import { backendUrl } from '../App';

const TriviaLeaderboard = ({ token }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/user/leaderboard`, { headers: { token } });
      if (res.data.success) {
        setLeaderboard(res.data.leaderboard);
      }
    } catch (error) {
      toast.error('Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchLeaderboard();
  }, [token]);


  return (
    <div className='p-0 w-full font-serif'>
      <div className='flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4'>
        <div>
          <h2 className='text-2xl font-black uppercase tracking-tighter'>
            Trivia <span className='text-[#BC002D]'>Leaderboard</span>
          </h2>
          <p className='text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1'>Leaderboard of trivia top scorers</p>
        </div>
      </div>

      <div className='bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden'>
        <table className='w-full text-left text-xs uppercase font-bold'>
          <thead className='bg-gray-50 text-gray-400 border-b border-gray-100'>
            <tr>
              <th className='p-4'>Collector</th>
              <th className='p-4'>Trivia Score</th>
              <th className='p-4'>Converted Coins</th>
              <th className='p-4'>Total Coins</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-50'>
            {loading ? (
              <tr>
                <td colSpan='4' className='p-20 text-center'>
                  <div className='flex flex-col items-center gap-4'>
                    <Loader2 className='animate-spin text-[#BC002D]' size={32} />
                    <p className='text-[10px] tracking-widest text-gray-400 animate-pulse'>Fetching leaderboard...</p>
                  </div>
                </td>
              </tr>
            ) : leaderboard.length > 0 ? (
              leaderboard.map((u) => {
                const score = u.triviaScore || 0;
                const handleConvert = async () => {
                  if (!score) return;
                  if (!confirm(`Convert ${score} trivia points to ${score} coins?`)) return;
                  try {
                    await axios.post(`${backendUrl}/api/user/convert-trivia`, {
                      userId: u._id,
                      convertAmount: score,
                      multiplier: 1
                    }, { headers: { token } });
                    toast.success(`Converted ${score} points to ${score} coins`);
                    fetchLeaderboard();
                  } catch (error) {
                    toast.error('Conversion failed');
                  }
                };
                return (
                  <tr key={u._id} className='hover:bg-gray-50/50 transition-colors'>
                    <td className='p-4'>
                      <div className='flex flex-col'>
                        <span className='text-black'>{u.name}</span>
                        <span className='text-[10px] text-gray-400 lowercase'>{u.email}</span>
                      </div>
                    </td>
                    <td className='p-4'>
                      <span className='text-amber-600 bg-amber-50 px-2 py-1 rounded-sm'>
                        {score}
                      </span>
                    </td>
                    <td className='p-4'>
                      <span className='text-green-600 bg-green-50 px-2 py-1 rounded-sm'>
                        {u.triviaCoins || 0}
                      </span>
                    </td>
                    <td className='p-4 flex items-center gap-2'>
                      <span className='text-amber-600 bg-amber-50 px-2 py-1 rounded-sm'>
                        {u.totalRewardPoints || 0}
                      </span>
                      {score > 0 && (
                        <button
                          onClick={handleConvert}
                          className='px-3 py-1 bg-[#BC002D] text-white text-[10px] font-bold uppercase tracking-wider rounded-sm hover:bg-black transition-all whitespace-nowrap'
                        >
                          Convert →
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan='4' className='p-20 text-center text-gray-400 italic tracking-widest uppercase text-[10px]'>
                  No leaderboard data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TriviaLeaderboard;