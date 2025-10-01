// frontend/src/components/Sidebar.jsx
// Sidebar de navigation avancée (catégories, tags, stats, etc.)
// Place ce fichier dans frontend/src/components/
// Utilise DaisyUI/Tailwind pour le style
// Utilise Lucide React pour les icônes

import { Home, LayoutDashboard, Server, Smartphone, Database, Code, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';

const categories = [
  { name: 'Toutes les questions', icon: Home, path: '/' },
  { name: 'Frontend', icon: LayoutDashboard, path: '/frontend' },
  { name: 'Backend', icon: Server, path: '/backend' },
  { name: 'Mobile', icon: Smartphone, path: '/mobile' },
  { name: 'Base de données', icon: Database, path: '/database' },
  { name: 'DevOps', icon: Code, path: '/devops' },
  { name: 'Web', icon: Globe, path: '/web' },
];

export default function Sidebar() {
  // State pour les tags populaires et stats
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState({ total: 0, resolution: 0, actifs: 0 });
  const location = useLocation();

  // Récupère les tags populaires et stats au chargement
  useEffect(() => {
    // À adapter selon ton backend
    axios.get('http://localhost:3001/api/tags')
      .then(res => setTags(res.data.tags || []))
      .catch(() => setTags([]));
    axios.get('http://localhost:3001/api/stats')
      .then(res => setStats(res.data))
      .catch(() => setStats({ total: 0, resolution: 0, actifs: 0 }));
  }, []);

  return (
    <aside className="w-72 min-h-screen bg-base-100 border-r flex flex-col p-4 gap-6">
      <h1 className="text-2xl font-bold text-primary mb-6">MiniStack</h1>
      <nav>
        <ul className="space-y-2">
          {categories.map(({ name, icon: Icon, path }) => (
            <li key={name}>
              <Link
                to={path}
                className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-primary/10 transition ${location.pathname === path ? 'bg-primary/20 font-semibold' : ''}`}
              >
                <Icon className="w-5 h-5" />
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div>
        <h2 className="font-semibold mb-2">Tags populaires</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Link
              key={tag.id}
              to={`/?tag=${encodeURIComponent(tag.name)}`}
              className={`transition-colors duration-200 px-3 py-1 text-xs font-semibold cursor-pointer select-none tag-badge`}
              style={{ background: tag.color, color: '#fff' }}
            >
              {tag.name}
            </Link>
          ))}
        </div>

      </div>
      <div>
        <h2 className="font-semibold mb-2">Statistiques</h2>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>Total questions: {stats.total}</li>
          <li>Taux de résolution: {stats.resolution}%</li>
          <li>Tags actifs: {stats.actifs}</li>
        </ul>
      </div>
    </aside>
  );
}
