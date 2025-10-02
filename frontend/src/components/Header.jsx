// Header de l'application (barre du haut avec recherche, bouton "Nouvelle Question", profil utilisateur)

import { Plus, Search, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import ThemeSwitcher from './ThemeSwitcher';
import Modal from './Modal';
import AskQuestion from '../pages/AskQuestion';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    setIsAuth(!!localStorage.getItem('token'));
    window.addEventListener('storage', () => setIsAuth(!!localStorage.getItem('token')));
    return () => window.removeEventListener('storage', () => setIsAuth(!!localStorage.getItem('token')));
  }, []);
  // À terme, tu pourras ajouter la gestion de l'utilisateur connecté ici
  return (
    <>
      <header className="w-full bg-base-100 border-b flex items-center justify-between px-6 py-3 sticky top-0 z-40">
        {/* Logo + recherche */}
        <div className="flex items-center gap-4">
          <a href="/" className="text-xl font-bold text-primary">MiniStack</a>
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
          {isAuth ? (
            <>
              <button className="btn btn-primary gap-2" onClick={() => setOpen(true)}>
                <Plus className="w-5 h-5" />
                Nouvelle Question
              </button>
              <ThemeSwitcher />
              {/* Menu utilisateur (à améliorer plus tard) */}
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <User className="w-6 h-6" />
                </label>
                <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
                  <li><a href="/profile">Mon profil</a></li>
                  <li><button
                    onClick={() => {
                      if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
                        localStorage.removeItem('token');
                        setIsAuth(false);
                        toast.success('Déconnexion réussie !');
                        setTimeout(() => window.location.reload(), 600);
                      }
                    }}
                  >Se déconnecter</button></li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <button className="btn btn-outline" onClick={() => setShowLogin(true)}>Connexion</button>
              <button className="btn btn-primary" onClick={() => setShowSignup(true)}>Inscription</button>
              <ThemeSwitcher />
              <LoginModal
                open={showLogin}
                onClose={() => setShowLogin(false)}
                onSwitch={() => { setShowLogin(false); setShowSignup(true); }}
              />
              <SignupModal
                open={showSignup}
                onClose={() => setShowSignup(false)}
                onSwitch={() => { setShowSignup(false); setShowLogin(true); }}
              />
            </>
          )}
        </div>
      </header>
      <Modal open={open} onClose={() => setOpen(false)}>
        <AskQuestion onSuccess={() => {
          setOpen(false);
          if (window.refreshQuestions) window.refreshQuestions();
        }} />
      </Modal>
    </>
  );
}
