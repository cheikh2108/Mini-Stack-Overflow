// Page pour poser une nouvelle question

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function AskQuestion({ onSuccess }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]); // tags sélectionnés (id)
  const [allTags, setAllTags] = useState([]); // tous les tags disponibles
  const [loading, setLoading] = useState(false);

  // Récupère tous les tags au chargement
  useEffect(() => {
    axios.get('http://localhost:3001/api/tags')
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
      await axios.post(
        'http://localhost:3001/api/questions',
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
    <div className="max-w-2xl mx-auto p-6 bg-base-100 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Poser une nouvelle question</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Titre de votre question</label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Décrivez votre problème en une phrase"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Détails de votre question</label>
          <textarea
            className="textarea textarea-bordered w-full min-h-[120px]"
            placeholder="Expliquez votre problème en détail. Ajoutez du code si nécessaire..."
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Tags (jusqu’à 5)</label>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                type="button"
                key={tag.id}
                className={`tag-badge px-3 py-1 text-xs font-semibold border-none focus:outline-none ${tags.includes(tag.id) ? 'ring-2 ring-primary' : ''}`}
                style={{ background: tag.color, color: '#fff', opacity: tags.includes(tag.id) ? 1 : 0.8 }}
                onClick={() => handleTagClick(tag.id)}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Envoi en cours...' : 'Poser la question'}
        </button>
      </form>
    </div>
  );
}
