// Page d'accueil : affiche la liste des questions récentes avec tags, auteur, etc.


import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import { User } from 'lucide-react';

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const tagFilter = searchParams.get('tag') || '';

  // Fonction pour charger les questions (réutilisable)
  const fetchQuestions = useCallback(() => {
    setLoading(true);
    let url = 'http://localhost:3001/api/questions';
    if (tagFilter) url += `?tag=${encodeURIComponent(tagFilter)}`;
    axios.get(url)
      .then(res => {
        setQuestions(res.data.questions || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur lors du chargement des questions');
        toast.error('Erreur lors du chargement des questions');
        setLoading(false);
      });
  }, [tagFilter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);
  window.refreshQuestions = fetchQuestions;

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-60 animate-pulse">
      <div className="w-16 h-16 rounded-full bg-primary/20 mb-4" />
      <div className="h-4 w-40 bg-base-200 rounded mb-2" />
      <div className="h-4 w-64 bg-base-200 rounded" />
    </div>
  );
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Questions récentes</h1>
      {questions.length === 0 ? (
        <div className="text-center text-gray-500">Aucune question pour le moment.</div>
      ) : (
        <div className="space-y-4">
          {questions.map(q => (
            <div key={q.id} className="card bg-base-100 shadow p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {q.tags && Array.isArray(q.tags) && q.tags.map(tag => (
                  <Link
                    key={tag.id}
                    to={`/?tag=${encodeURIComponent(tag.name)}`}
                    className="tag-badge px-3 py-1 text-xs font-semibold cursor-pointer select-none"
                    style={{ background: tag.color, color: '#fff' }}
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
              <h2 className="font-semibold text-lg mb-1 truncate">{q.title}</h2>
              <p className="text-gray-600 mb-2 line-clamp-2">{q.content}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 opacity-60" />
                  <span className="font-medium">{q.author?.username || 'Utilisateur inconnu'}</span>
                </div>
                <span>{new Date(q.created_at).toLocaleDateString()}</span>
                <span>{q.views} vues</span>
                <span>{q.votes} votes</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
