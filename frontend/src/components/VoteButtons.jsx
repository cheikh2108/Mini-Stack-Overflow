
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function VoteButtons({ votableId, votableType, initialVotes, initialVoteType }) {
  const [votes, setVotes] = useState(initialVotes);
  const [userVoteType, setUserVoteType] = useState(initialVoteType || 0);
  const [loading, setLoading] = useState(false);

  const handleVote = async (voteType) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vous devez être connecté pour voter.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        'http://localhost:3001/api/votes',
        { votable_id: votableId, vote_type: voteType, votable_type: votableType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVotes(res.data.total_votes);
      setUserVoteType(res.data.new_vote_type);
    } catch (error) {
      toast.error('Erreur lors du vote.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        className={`btn btn-ghost btn-sm p-1 ${userVoteType === 1 ? 'text-orange-500 bg-orange-50' : ''}`}
        onClick={() => handleVote(1)}
        disabled={loading}
      >
        <ChevronUp className={`w-8 h-8 ${userVoteType === 1 ? 'fill-current' : ''}`} />
      </button>
      <span className="text-xl font-bold">{votes}</span>
      <button
        className={`btn btn-ghost btn-sm p-1 ${userVoteType === -1 ? 'text-blue-500 bg-blue-50' : ''}`}
        onClick={() => handleVote(-1)}
        disabled={loading}
      >
        <ChevronDown className={`w-8 h-8 ${userVoteType === -1 ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
}
