
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User, Calendar, Eye, MessageSquare, ChevronUp, ChevronDown, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VoteButtons from '../components/VoteButtons';
import api from '../lib/api';
import { formatDate, formatNumber } from '../lib/format';

export default function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const isAuth = !!localStorage.getItem('token');
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const answerCount = answers.length;

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
      }
    }
  }, []);

  const fetchQuestionData = useCallback(async () => {
    try {
      const [qRes, aRes] = await Promise.all([
        api.get(`/questions/${id}`),
        api.get(`/answers/${id}`)
      ]);
      setQuestion(qRes.data);
      setAnswers(aRes.data);
    } catch {
      toast.error('Erreur lors du chargement de la question');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuestionData();
  }, [fetchQuestionData]);

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.post(
        '/answers',
        { content: newAnswer, question_id: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Réponse ajoutée !');
      setNewAnswer('');
      setAnswers([...answers, res.data]);
    } catch {
      toast.error('Erreur lors de l’ajout de la réponse');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      const token = localStorage.getItem('token');
      await api.patch(
        `/answers/${answerId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Réponse acceptée !');
      // Mettre à jour l'état local
      setAnswers(answers.map(a => ({
        ...a,
        is_accepted: a.id === answerId
      })));
    } catch {
      toast.error('Erreur lors de l’acceptation de la réponse');
    }
  };

  const handleDeleteQuestion = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette question ?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Question supprimée');
      navigate('/');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette réponse ?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/answers/${answerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Réponse supprimée');
      setAnswers(answers.filter(a => a.id !== answerId));
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleUpdateAnswer = async (answerId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.put(`/answers/${answerId}`, {
        content: editedContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Réponse mise à jour');
      setAnswers(answers.map(a => a.id === answerId ? res.data : a));
      setEditingAnswer(null);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center rounded-3xl border border-base-300/70 bg-base-100/85 py-20 shadow-sm">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  );

  if (!question) return (
    <div className="rounded-3xl border border-base-300/70 bg-base-100/85 p-10 text-center shadow-sm">
      <h2 className="text-2xl font-black">Question introuvable</h2>
      <p className="mt-2 text-base-content/70">Le sujet demandé n’existe plus ou l’identifiant est invalide.</p>
      <Link to="/" className="btn btn-primary mt-6 rounded-2xl">Retour à l’accueil</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-base-300/70 bg-base-100/85 p-6 shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-primary badge-outline">Question</span>
              {question.tags && question.tags.map(tag => (
                <Link
                  key={tag.id}
                  to={`/?tag=${encodeURIComponent(tag.name)}`}
                  className="tag-badge inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm"
                  style={{ background: tag.color, color: '#fff' }}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-balance md:text-4xl">{question.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-base-content/60">
              <span className="rounded-full bg-base-200/70 px-3 py-1">{formatDate(question.created_at)}</span>
              <span className="rounded-full bg-base-200/70 px-3 py-1 tabular-nums">{formatNumber(question.views)} vues</span>
              <span className="rounded-full bg-base-200/70 px-3 py-1 tabular-nums">{formatNumber(question.votes)} votes</span>
            </div>
          </div>

          {isAuth && currentUser?.id === question.author?.id && (
            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost btn-sm gap-2 rounded-2xl text-base-content/70">
                <Edit className="w-4 h-4" aria-hidden="true" /> Modifier
              </button>
              <button type="button" className="btn btn-ghost btn-sm gap-2 rounded-2xl text-error" onClick={handleDeleteQuestion}>
                <Trash2 className="w-4 h-4" aria-hidden="true" /> Supprimer
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-base-300/70 bg-base-100/85 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-shrink-0">
            <VoteButtons
              votableId={question.id}
              votableType="question"
              initialVotes={question.votes}
            />
          </div>

          <div className="min-w-0 flex-1">
            <article className="prose max-w-none">
              <p className="whitespace-pre-wrap text-lg text-base-content/85">{question.content}</p>
            </article>

            <div className="mt-8 flex justify-end">
              <div className="flex items-center gap-3 rounded-2xl bg-base-200/70 px-4 py-3">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-10">
                    <User className="w-5 h-5" aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-base-content/55">Posée par</p>
                  <p className="text-sm font-semibold">{question.author?.username}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <MessageSquare className="w-6 h-6" aria-hidden="true" />
            {answerCount} {answerCount > 1 ? 'Réponses' : 'Réponse'}
          </h2>
          {answerCount > 0 && <span className="badge badge-ghost border border-base-300">{answerCount} contribution{answerCount > 1 ? 's' : ''}</span>}
        </div>

        {answerCount === 0 ? (
          <div className="rounded-3xl border border-base-300/70 bg-base-100/85 p-8 text-center shadow-sm">
            <p className="text-base-content/70">Aucune réponse pour l’instant. Votre réponse peut ouvrir la discussion.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {answers.map(answer => (
              <article key={answer.id} className={`rounded-3xl border border-base-300/70 bg-base-100/85 p-5 shadow-sm ${answer.is_accepted ? 'ring-2 ring-success/20' : ''}`}>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <VoteButtons
                      votableId={answer.id}
                      votableType="answer"
                      initialVotes={answer.votes}
                    />
                    {answer.is_accepted ? (
                      <CheckCircle className="mt-2 h-8 w-8 text-success" title="Réponse acceptée" aria-hidden="true" />
                    ) : (
                      isAuth && currentUser?.id === question.author?.id && (
                        <button
                          className="btn btn-ghost btn-sm mt-2 rounded-full p-2 text-base-content/30 hover:text-success focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                          onClick={() => handleAcceptAnswer(answer.id)}
                          title="Accepter cette réponse"
                          type="button"
                        >
                          <CheckCircle className="h-8 w-8" aria-hidden="true" />
                        </button>
                      )
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    {editingAnswer === answer.id ? (
                      <div className="mb-4">
                        <label className="sr-only" htmlFor={`answer-edit-${answer.id}`}>Modifier la réponse</label>
                        <textarea
                          id={`answer-edit-${answer.id}`}
                          className="textarea textarea-bordered mb-2 w-full rounded-2xl border-base-300/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button type="button" className="btn btn-primary btn-sm rounded-2xl" onClick={() => handleUpdateAnswer(answer.id)}>Sauvegarder</button>
                          <button type="button" className="btn btn-ghost btn-sm rounded-2xl" onClick={() => setEditingAnswer(null)}>Annuler</button>
                        </div>
                      </div>
                    ) : (
                      <p className="mb-4 whitespace-pre-wrap text-base-content/85">{answer.content}</p>
                    )}

                    <div className="flex flex-col gap-3 text-sm lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-2">
                        {isAuth && currentUser?.id === answer.author?.id && !editingAnswer && (
                          <>
                            <button
                              type="button"
                              className="btn btn-link btn-xs flex items-center gap-1 p-0 text-base-content/60 no-underline hover:text-primary"
                              onClick={() => {
                                setEditingAnswer(answer.id);
                                setEditedContent(answer.content);
                              }}
                            >
                              <Edit className="w-3 h-3" aria-hidden="true" /> modifier
                            </button>
                            <button
                              type="button"
                              className="btn btn-link btn-xs flex items-center gap-1 p-0 text-error no-underline"
                              onClick={() => handleDeleteAnswer(answer.id)}
                            >
                              <Trash2 className="w-3 h-3" aria-hidden="true" /> supprimer
                            </button>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-base-content/60">
                        <span className="font-medium text-primary">{answer.author?.username}</span>
                        <span>répondu le {formatDate(answer.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* New Answer Form */}
      <div className="mt-10 rounded-3xl border border-base-300/70 bg-base-100/85 p-6 shadow-sm">
        <h3 className="text-xl font-bold">Votre réponse</h3>
        <p className="mt-1 text-sm text-base-content/65">Apportez un exemple concret, une explication courte et un pas suivant clair.</p>
        {isAuth ? (
          <form onSubmit={handleAnswerSubmit} className="mt-4">
            <label className="sr-only" htmlFor="new-answer">Rédigez votre réponse</label>
            <textarea
              id="new-answer"
              className="textarea textarea-bordered mb-4 min-h-[180px] w-full rounded-2xl border-base-300/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
              placeholder="Rédigez votre réponse ici…"
              autoComplete="off"
              spellCheck={false}
              value={newAnswer}
              onChange={e => setNewAnswer(e.target.value)}
              required
            />
            <button
              type="submit"
              className="btn btn-primary rounded-2xl shadow-sm"
              disabled={submitting || !newAnswer.trim()}
            >
              {submitting ? 'Envoi…' : 'Poster votre réponse'}
            </button>
          </form>
        ) : (
          <div className="alert mt-4 border border-base-300/70 bg-base-200/70 shadow-sm">
            <div>
              <p>Vous devez être connecté pour répondre à cette question.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
