// frontend/src/components/Header.jsx
// Header de l'application (barre du haut avec recherche, bouton "Nouvelle Question", profil utilisateur)
// Place ce fichier dans frontend/src/components/
// Utilise DaisyUI/Tailwind pour le style
// Utilise Lucide React pour les icônes

import { Plus, Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher';

export default function Header() {
  // À terme, tu pourras ajouter la gestion de l'utilisateur connecté ici
  return (
    <header className="w-full bg-base-100 border-b flex items-center justify-between px-6 py-3 sticky top-0 z-40">
      {/* Logo + recherche */}
      <div className="flex items-center gap-4">
        <Link to="/" className="text-xl font-bold text-primary">MiniStack</Link>
        <form className="hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher des questions..."
              className="input input-bordered pl-10 w-80"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </form>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link to="/ask" className="btn btn-primary gap-2">
          <Plus className="w-5 h-5" />
          Nouvelle Question
        </Link>
        <ThemeSwitcher />
        {/* Menu utilisateur (à améliorer plus tard) */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
            <User className="w-6 h-6" />
          </label>
          <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
            <li><Link to="/profile">Mon profil</Link></li>
            <li><button>Se déconnecter</button></li>
          </ul>
        </div>
      </div>
    </header>
  );
}
