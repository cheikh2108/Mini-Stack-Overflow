
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { User, Calendar, Eye, MessageSquare, ChevronUp, ChevronDown, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VoteButtons from '../components/VoteButtons';

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
        axios.get(`http://localhost:3001/api/questions/${id}`),
        axios.get(`http://localhost:3001/api/answers/${id}`)
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
      const res = await axios.post(
        'http://localhost:3001/api/answers',
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
      await axios.patch(
        `http://localhost:3001/api/answers/${answerId}/accept`,
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
      await axios.delete(`http://localhost:3001/api/questions/${id}`, {
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
      await axios.delete(`http://localhost:3001/api/answers/${answerId}`, {
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
      const res = await axios.put(`http://localhost:3001/api/answers/${answerId}`, {
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
    <div className="flex justify-center items-center h-64">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );

  if (!question) return (
    <div className="text-center mt-10">
      <h2 className="text-2xl font-bold">Question introuvable</h2>
      <Link to="/" className="btn btn-link">Retour à l'accueil</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Question Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{question.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 border-b pb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Posée le {new Date(question.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{question.views} vues</span>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Vote Sidebar */}
          <VoteButtons
            votableId={question.id}
            votableType="question"
            initialVotes={question.votes}
          />

          <div className="flex-1">
            <div className="prose max-w-none mb-6">
              <p className="whitespace-pre-wrap text-lg">{question.content}</p>
            </div>

            <div className="flex items-center gap-4 mb-6">
              {isAuth && currentUser?.id === question.author?.id && (
                <>
                  <button className="btn btn-ghost btn-sm gap-2 text-gray-500">
                    <Edit className="w-4 h-4" /> Modifier
                  </button>
                  <button className="btn btn-ghost btn-sm gap-2 text-red-500" onClick={handleDeleteQuestion}>
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </button>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {question.tags && question.tags.map(tag => (
                <Link
                  key={tag.id}
                  to={`/?tag=${encodeURIComponent(tag.name)}`}
                  className="tag-badge px-3 py-1 text-xs font-semibold"
                  style={{ background: tag.color, color: '#fff' }}
                >
                  {tag.name}
                </Link>
              ))}
            </div>

            <div className="flex justify-end">
              <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-3">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-8">
                    <User className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Posée par</p>
                  <p className="text-sm font-semibold">{question.author?.username}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            {answers.length} {answers.length > 1 ? 'Réponses' : 'Réponse'}
          </h2>
        </div>

        <div className="space-y-6">
          {answers.map(answer => (
            <div key={answer.id} className={`border-b pb-6 ${answer.is_accepted ? 'bg-green-50/50 p-4 rounded-lg' : ''}`}>
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <VoteButtons
                    votableId={answer.id}
                    votableType="answer"
                    initialVotes={answer.votes}
                  />
                  {answer.is_accepted ? (
                    <CheckCircle className="w-8 h-8 text-green-500 mt-2" title="Réponse acceptée" />
                  ) : (
                    isAuth && currentUser?.id === question.author?.id && (
                      <button
                        className="btn btn-ghost btn-sm p-1 mt-2 text-gray-300 hover:text-green-500"
                        onClick={() => handleAcceptAnswer(answer.id)}
                        title="Accepter cette réponse"
                      >
                        <CheckCircle className="w-8 h-8" />
                      </button>
                    )
                  )}
                </div>

                <div className="flex-1">
                  {editingAnswer === answer.id ? (
                    <div className="mb-4">
                      <textarea
                        className="textarea textarea-bordered w-full mb-2"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button className="btn btn-primary btn-sm" onClick={() => handleUpdateAnswer(answer.id)}>Sauvegarder</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditingAnswer(null)}>Annuler</button>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap mb-4">{answer.content}</p>
                  )}

                  <div className="flex justify-between items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      {isAuth && currentUser?.id === answer.author?.id && !editingAnswer && (
                        <>
                          <button
                            className="btn btn-link btn-xs p-0 text-gray-500 flex items-center gap-1 no-underline"
                            onClick={() => {
                              setEditingAnswer(answer.id);
                              setEditedContent(answer.content);
                            }}
                          >
                            <Edit className="w-3 h-3" /> modifier
                          </button>
                          <button
                            className="btn btn-link btn-xs p-0 text-red-500 flex items-center gap-1 no-underline"
                            onClick={() => handleDeleteAnswer(answer.id)}
                          >
                            <Trash2 className="w-3 h-3" /> supprimer
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-primary">{answer.author?.username}</span>
                      <span className="text-gray-500">répondu le {new Date(answer.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Answer Form */}
      <div className="mt-10 border-t pt-8">
        <h3 className="text-xl font-bold mb-4">Votre réponse</h3>
        {isAuth ? (
          <form onSubmit={handleAnswerSubmit}>
            <textarea
              className="textarea textarea-bordered w-full min-h-[150px] mb-4 focus:ring-2 focus:ring-primary"
              placeholder="Rédigez votre réponse ici..."
              value={newAnswer}
              onChange={e => setNewAnswer(e.target.value)}
              required
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !newAnswer.trim()}
            >
              {submitting ? 'Envoi...' : 'Poster votre réponse'}
            </button>
          </form>
        ) : (
          <div className="alert bg-base-200 shadow-sm">
            <div>
              <p>Vous devez être connecté pour répondre à cette question.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
