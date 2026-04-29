import { Plus, Search, User, Menu, X, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ThemeSwitcher from './ThemeSwitcher';
import Modal from './Modal';
import AskQuestion from '../pages/AskQuestion';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

export default function Header({ onSidebarToggle, sidebarOpen }) {
  const [open, setOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const syncAuthState = () => setIsAuth(!!localStorage.getItem('token'));

    syncAuthState();
    window.addEventListener('storage', syncAuthState);
    window.addEventListener('auth-changed', syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('auth-changed', syncAuthState);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/');
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuth(false);
      window.dispatchEvent(new Event('auth-changed'));
      toast.success('Déconnexion réussie !');
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-base-300/70 bg-base-100/90 shadow-sm backdrop-blur">
        {/* Desktop Layout */}
        <div className="hidden sm:block px-4 py-3">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 text-xl font-black tracking-tight text-primary hover:text-primary/80 transition-colors duration-200">
              MiniStack
            </Link>
            
            {/* Search Bar */}
            <form className="flex-1 max-w-xl" onSubmit={handleSearch}>
              <label htmlFor="site-search" className="sr-only">Rechercher des questions</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-base-content/35" aria-hidden="true" />
                <input
                  id="site-search"
                  name="search"
                  type="search"
                  placeholder="Rechercher des questions…"
                  autoComplete="off"
                  spellCheck={false}
                  className="input-modern w-full pl-11 pr-4"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </form>

            {/* Desktop Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isAuth ? (
                <>
                  <button 
                    className="btn btn-primary gap-2 shadow-sm touch-target"
                    onClick={() => setOpen(true)}
                    aria-label="Créer une nouvelle question"
                  >
                    <Plus className="h-5 w-5" aria-hidden="true" />
                    <span className="hidden lg:inline">Nouvelle Question</span>
                  </button>
                  <ThemeSwitcher />
                  <div className="dropdown dropdown-end">
                    <button 
                      tabIndex={0} 
                      className="btn btn-ghost btn-circle avatar touch-target"
                      aria-label="Menu utilisateur"
                    >
                      <User className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <ul 
                      tabIndex={0} 
                      className="menu menu-compact dropdown-content mt-3 w-52 rounded-lg bg-base-100 p-2 shadow-lg border border-base-300/70 gap-1"
                    >
                      <li><Link to="/profile" className="rounded-md">Mon profil</Link></li>
                      <li><button type="button" onClick={handleLogout} className="rounded-md">Se déconnecter</button></li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <button 
                    className="btn btn-outline touch-target"
                    onClick={() => setShowLogin(true)}
                  >
                    Connexion
                  </button>
                  <button 
                    className="btn btn-primary shadow-sm touch-target"
                    onClick={() => setShowSignup(true)}
                  >
                    Inscription
                  </button>
                  <ThemeSwitcher />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <Link to="/" className="text-lg font-black tracking-tight text-primary flex-shrink-0">
              MiniStack
            </Link>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Sidebar Toggle Button */}
              <button
                onClick={() => onSidebarToggle?.()}
                className="btn btn-ghost btn-circle btn-sm touch-target hover:bg-base-200"
                aria-label="Catégories"
                aria-pressed={sidebarOpen}
              >
                <Filter className="h-6 w-6" aria-hidden="true" />
              </button>

              <ThemeSwitcher />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="btn btn-ghost btn-circle btn-sm touch-target"
                aria-label="Menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Drawer */}
          {mobileMenuOpen && (
            <div className="animate-slide-in-down mt-2 space-y-2 rounded-lg bg-base-200/50 p-3 border border-base-300">
              {/* Search on Mobile */}
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-base-content/35" aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Rechercher…"
                    autoComplete="off"
                    spellCheck={false}
                    className="input-modern h-9 w-full pl-10 pr-3 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </form>

              <div className="divider-subtle my-2" />

              {isAuth ? (
                <>
                  <button
                    onClick={() => {
                      setOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="btn btn-primary w-full gap-2 justify-start text-sm h-9"
                  >
                    <Plus className="h-5 w-5" aria-hidden="true" />
                    Nouvelle Question
                  </button>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-ghost w-full justify-start text-sm h-9"
                  >
                    <User className="h-5 w-5" aria-hidden="true" />
                    Mon profil
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn btn-ghost w-full justify-start text-sm h-9"
                  >
                    Se déconnecter
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-outline w-full text-sm h-9"
                    onClick={() => {
                      setShowLogin(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    Connexion
                  </button>
                  <button
                    className="btn btn-primary w-full text-sm h-9"
                    onClick={() => {
                      setShowSignup(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    Inscription
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Modals */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <AskQuestion onSuccess={() => {
          setOpen(false);
          if (window.refreshQuestions) window.refreshQuestions();
        }} />
      </Modal>

      {!isAuth && (
        <>
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
    </>
  );
}
