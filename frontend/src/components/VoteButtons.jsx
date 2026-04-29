
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ChevronUp, ChevronDown } from 'lucide-react';
import api from '../lib/api';

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
      const res = await api.post(
        '/votes',
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
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-base-300/70 bg-base-100/85 p-2 shadow-sm">
      <button
        className={`btn btn-ghost btn-sm p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${userVoteType === 1 ? 'bg-orange-50 text-orange-500' : 'hover:bg-base-200'}`}
        onClick={() => handleVote(1)}
        type="button"
        disabled={loading}
        aria-label={`Voter positivement pour ce ${votableType}`}
        aria-pressed={userVoteType === 1}
      >
        <ChevronUp className={`h-8 w-8 ${userVoteType === 1 ? 'fill-current' : ''}`} aria-hidden="true" />
      </button>
      <span className="text-xl font-black tabular-nums">{votes}</span>
      <button
        className={`btn btn-ghost btn-sm p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${userVoteType === -1 ? 'bg-blue-50 text-blue-500' : 'hover:bg-base-200'}`}
        onClick={() => handleVote(-1)}
        type="button"
        disabled={loading}
        aria-label={`Voter négativement pour ce ${votableType}`}
        aria-pressed={userVoteType === -1}
      >
        <ChevronDown className={`h-8 w-8 ${userVoteType === -1 ? 'fill-current' : ''}`} aria-hidden="true" />
      </button>
    </div>
  );
}
