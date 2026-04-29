import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import { User } from 'lucide-react';
import VoteButtons from '../components/VoteButtons';
import api from '../lib/api';
import { formatDate, formatNumber } from '../lib/format';

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const tagFilter = searchParams.get('tag') || '';
  const searchQuery = searchParams.get('search') || '';
  const hasFilters = Boolean(tagFilter || searchQuery);

  // Fonction pour charger les questions (réutilisable)
  const fetchQuestions = useCallback(() => {
    setLoading(true);
    setError(null);
    api.get('/questions', {
      params: {
        ...(tagFilter ? { tag: tagFilter } : {}),
        ...(searchQuery ? { search: searchQuery } : {}),
      },
    })
      .then(res => {
        setQuestions(res.data.questions || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur lors du chargement des questions');
        toast.error('Erreur lors du chargement des questions');
        setLoading(false);
      });
  }, [tagFilter, searchQuery]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);
  window.refreshQuestions = fetchQuestions;

  if (loading) return (
    <div className="space-y-3 sm:space-y-4 animate-pulse">
      <div className="rounded-2xl sm:rounded-3xl border border-base-300/70 bg-base-100/80 p-4 sm:p-6 shadow-sm">
        <div className="h-4 sm:h-5 w-32 rounded-full bg-base-200" />
        <div className="mt-3 sm:mt-4 h-8 sm:h-10 w-3/4 rounded-2xl bg-base-200" />
        <div className="mt-2 sm:mt-3 h-3 sm:h-4 w-full rounded-full bg-base-200/80" />
        <div className="mt-2 h-3 sm:h-4 w-5/6 rounded-full bg-base-200/70" />
      </div>
      <div className="space-y-3 sm:space-y-4">
        <div className="h-24 sm:h-32 rounded-2xl sm:rounded-3xl bg-base-100/70" />
        <div className="h-24 sm:h-32 rounded-2xl sm:rounded-3xl bg-base-100/70" />
        <div className="h-24 sm:h-32 rounded-2xl sm:rounded-3xl bg-base-100/70" />
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="rounded-3xl border border-error/20 bg-error/5 p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-error">Impossible de charger les questions</h2>
        <p className="mt-2 text-base-content/70">Vérifiez la connexion à l’API puis réessayez.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-base-300/40 bg-gradient-to-br from-primary/10 via-base-100/80 to-secondary/10 p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 mix-blend-multiply blur-3xl filter" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-secondary/20 mix-blend-multiply blur-3xl filter" />
        
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl flex-1">
            <span className="badge border-primary/30 bg-primary/10 text-primary font-semibold px-4 py-3 rounded-full mb-5 shadow-sm backdrop-blur-md">Communauté technique</span>
            <h1 className="text-4xl font-black tracking-tight text-balance md:text-5xl lg:text-6xl bg-gradient-to-br from-base-content to-base-content/60 bg-clip-text text-transparent pb-1">
              Des réponses claires pour les questions qui bloquent votre code.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-base-content/70 leading-relaxed font-medium">
              Parcourez les dernières discussions, filtrez par tag ou lancez une recherche pour aller directement à la bonne solution.
            </p>
            {hasFilters && (
              <div className="mt-6 flex flex-wrap gap-3">
                {tagFilter && <span className="badge badge-primary badge-outline px-4 py-3 rounded-full shadow-sm hover:scale-105 transition-transform cursor-default">Tag: {tagFilter}</span>}
                {searchQuery && <span className="badge badge-secondary badge-outline px-4 py-3 rounded-full shadow-sm hover:scale-105 transition-transform cursor-default">Recherche: {searchQuery}</span>}
                <Link to="/" className="badge badge-ghost border border-base-300 px-4 py-3 rounded-full shadow-sm hover:bg-base-200 transition-colors">Réinitialiser</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {questions.length === 0 ? (
        <div className="rounded-3xl border border-base-300/70 bg-base-100/80 p-10 text-center shadow-sm">
          <h2 className="text-xl font-bold">Aucune question trouvée</h2>
          <p className="mt-2 text-base-content/70">
            Essayez un autre mot-clé, un autre tag, ou posez la première question du sujet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map(q => (
            <article key={q.id} className="group rounded-3xl border border-base-300/70 bg-base-100/85 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
              <div className="flex flex-col gap-5 md:flex-row md:items-start">
              <div className="flex-shrink-0 md:pt-1">
                <VoteButtons
                  votableId={q.id}
                  votableType="question"
                  initialVotes={q.votes}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {q.tags && Array.isArray(q.tags) && q.tags.map(tag => (
                    <Link
                      key={tag.id}
                      to={`/?tag=${encodeURIComponent(tag.name)}`}
                      className="tag-badge inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      style={{ background: tag.color, color: '#fff' }}
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
                <Link to={`/questions/${q.id}`} className="block">
                  <h2 className="mt-3 text-xl font-semibold tracking-tight text-balance transition-colors group-hover:text-primary">
                    {q.title}
                  </h2>
                </Link>
                <p className="mt-3 line-clamp-3 text-base-content/75">{q.content}</p>
                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-base-content/55">
                  <div className="flex items-center gap-2 rounded-full bg-base-200/70 px-3 py-1">
                    <User className="h-4 w-4" aria-hidden="true" />
                    <span className="font-medium text-base-content/80">{q.author?.username || 'Utilisateur inconnu'}</span>
                  </div>
                  <span className="rounded-full bg-base-200/70 px-3 py-1 tabular-nums">{formatDate(q.created_at)}</span>
                  <span className="rounded-full bg-base-200/70 px-3 py-1 tabular-nums">{formatNumber(q.views)} vues</span>
                  <span className="rounded-full bg-base-200/70 px-3 py-1 tabular-nums">{formatNumber(q.votes)} votes</span>
                </div>
              </div>
              <div className="md:pt-1 md:text-right">
                <Link to={`/questions/${q.id}`} className="btn btn-outline btn-sm mt-1">
                  Lire
                </Link>
              </div>
            </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
