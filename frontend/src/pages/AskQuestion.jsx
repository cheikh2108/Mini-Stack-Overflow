// Page pour poser une nouvelle question

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';
import { formatNumber } from '../lib/format';

export default function AskQuestion({ onSuccess }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]); // tags sélectionnés (id)
  const [allTags, setAllTags] = useState([]); // tous les tags disponibles
  const [loading, setLoading] = useState(false);
  const selectedTagsCount = tags.length;

  // Récupère tous les tags au chargement
  useEffect(() => {
    api.get('/tags')
      .then(res => setAllTags(res.data.tags || []))
      .catch(() => setAllTags([]));
  }, []);

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || tags.length === 0) {
      toast.error('Veuillez remplir tous les champs et sélectionner au moins un tag.');
      return;
    }
    setLoading(true);
    try {
      // Récupère le token JWT du localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vous devez être connecté pour poser une question.');
        setLoading(false);
        return;
      }
      await api.post(
        '/questions',
        { title, content, tags },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Question posée avec succès !');
      setTitle('');
      setContent('');
      setTags([]);
      if (onSuccess) onSuccess();
    } catch {
      toast.error('Erreur lors de la création de la question.');
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la sélection des tags (max 5)
  const handleTagClick = (id) => {
    if (tags.includes(id)) {
      setTags(tags.filter(t => t !== id));
    } else if (tags.length < 5) {
      setTags([...tags, id]);
    } else {
      toast('Vous pouvez sélectionner jusqu’à 5 tags.');
    }
  };

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
      <div className="rounded-2xl sm:rounded-3xl border border-base-300/70 bg-base-100/85 p-4 sm:p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <div className="mb-4 sm:mb-6">
          <span className="badge badge-primary badge-outline mb-2 sm:mb-3 text-xs sm:text-sm">Nouvelle question</span>
          <h1 className="text-2xl sm:text-3xl lg:text-3xl font-black tracking-tight text-balance">Posez une question claire et partageable.</h1>
          <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-base-content/70">Un bon titre, du contexte, puis quelques tags précis donnent des réponses plus rapides et plus utiles.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
          <div>
            <label htmlFor="question-title" className="mb-1.5 sm:mb-2 block text-sm sm:text-base font-semibold">Titre de votre question</label>
            <input
              id="question-title"
              name="title"
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="input input-bordered w-full rounded-xl sm:rounded-2xl border-base-300/70 text-sm sm:text-base h-10 sm:h-11 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
              placeholder="Décrivez votre problème en une phrase…"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="question-content" className="mb-1.5 sm:mb-2 block text-sm sm:text-base font-semibold">Détails de votre question</label>
            <textarea
              id="question-content"
              name="content"
              autoComplete="off"
              spellCheck={false}
              className="textarea textarea-bordered w-full min-h-[150px] sm:min-h-[200px] rounded-xl sm:rounded-2xl border-base-300/70 text-sm sm:text-base focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
              placeholder="Expliquez le contexte, ce que vous avez déjà essayé, et collez un extrait de code si besoin…"
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="mb-1.5 sm:mb-2 flex items-center justify-between gap-2">
              <label className="block text-sm sm:text-base font-semibold">Tags</label>
              <span className="text-xs sm:text-sm text-base-content/55">{formatNumber(selectedTagsCount)}/5</span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {allTags.map(tag => {
                const isSelected = tags.includes(tag.id);

                return (
                  <button
                    type="button"
                    key={tag.id}
                    aria-pressed={isSelected}
                    className={`tag-badge rounded-full border px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-xs font-semibold shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100 scale-110' : 'hover:scale-105'}`}
                    style={{ background: tag.color, color: '#fff', opacity: isSelected ? 1 : 0.72 }}
                    onClick={() => handleTagClick(tag.id)}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 h-10 sm:h-11 text-sm sm:text-base" disabled={loading}>
            {loading ? 'Envoi en cours…' : 'Poser la question'}
          </button>
        </form>
      </div>

      <aside className="rounded-2xl sm:rounded-3xl border border-base-300/70 bg-base-100/85 p-4 sm:p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg">
        <h2 className="text-base sm:text-lg font-bold">Conseils rapides</h2>
        <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-xs sm:text-sm text-base-content/70">
          <li className="flex gap-2"><span>✓</span><span>Commencez par un titre précis qui décrit le problème.</span></li>
          <li className="flex gap-2"><span>✓</span><span>Ajoutez le contexte: environnement, erreur, étape reproduisible.</span></li>
          <li className="flex gap-2"><span>✓</span><span>Choisissez des tags proches du sujet.</span></li>
        </ul>
        <div className="mt-4 sm:mt-6 rounded-xl sm:rounded-2xl bg-base-200/70 p-3 sm:p-4 transition-transform hover:scale-105 duration-300">
          <p className="text-[0.6rem] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.18em] text-base-content/55">Checklist</p>
          <div className="mt-2 space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between"><span>Titre</span><span className={title ? 'text-success font-semibold' : 'text-base-content/40'}>{title ? '✓' : '○'}</span></div>
            <div className="flex items-center justify-between"><span>Contenu</span><span className={content ? 'text-success font-semibold' : 'text-base-content/40'}>{content ? '✓' : '○'}</span></div>
            <div className="flex items-center justify-between"><span>Tags</span><span className={selectedTagsCount > 0 ? 'text-success font-semibold' : 'text-base-content/40'}>{selectedTagsCount > 0 ? '✓' : '○'}</span></div>
          </div>
        </div>
      </aside>
    </div>
  );
}
