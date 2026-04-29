// Page de connexion utilisateur (login)
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email,
        password
      });
      const { token, user } = res.data;
      if (token) {
        localStorage.setItem('token', token);
        if (user) localStorage.setItem('user', JSON.stringify(user));
        window.dispatchEvent(new Event('auth-changed'));
        toast.success('Connexion réussie !');
        navigate('/');
      } else {
        toast.error('Token manquant dans la réponse.');
      }
    } catch {
      toast.error('Identifiants invalides ou erreur serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
      <section className="rounded-2xl sm:rounded-3xl border border-base-300/70 bg-base-100/85 p-4 sm:p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <span className="badge badge-primary badge-outline mb-3 sm:mb-4 text-xs sm:text-sm">Connexion</span>
        <h1 className="text-2xl sm:text-3xl lg:text-3xl font-black tracking-tight text-balance">Reprenez là où vous en étiez.</h1>
        <p className="mt-2 sm:mt-3 max-w-xl text-sm sm:text-base text-base-content/70">Accédez à vos questions, répondez aux discussions et continuez à faire monter la qualité des réponses.</p>
        <div className="mt-6 sm:mt-8 grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-3">
          <div className="rounded-xl sm:rounded-2xl bg-base-200/70 p-3 sm:p-4 transition-transform hover:scale-105 duration-300">
            <p className="text-xs sm:text-sm font-semibold">Questions</p>
            <p className="mt-1 text-xs sm:text-sm text-base-content/65">Suivez les sujets qui vous intéressent.</p>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-base-200/70 p-3 sm:p-4 transition-transform hover:scale-105 duration-300">
            <p className="text-xs sm:text-sm font-semibold">Réponses</p>
            <p className="mt-1 text-xs sm:text-sm text-base-content/65">Contribuez en quelques secondes.</p>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-base-200/70 p-3 sm:p-4 transition-transform hover:scale-105 duration-300">
            <p className="text-xs sm:text-sm font-semibold">Profil</p>
            <p className="mt-1 text-xs sm:text-sm text-base-content/65">Gardez votre historique accessible.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl sm:rounded-3xl border border-base-300/70 bg-base-100/85 p-4 sm:p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <h2 className="text-xl sm:text-2xl font-bold">Connexion</h2>
        <form onSubmit={handleSubmit} className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1.5 sm:mb-2 block text-sm sm:text-base font-semibold">Adresse email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              className="input input-bordered w-full rounded-xl sm:rounded-2xl border-base-300/70 text-sm sm:text-base h-10 sm:h-11 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="mb-1.5 sm:mb-2 block text-sm sm:text-base font-semibold">Mot de passe</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="input input-bordered w-full rounded-xl sm:rounded-2xl border-base-300/70 text-sm sm:text-base h-10 sm:h-11 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 h-10 sm:h-11 text-sm sm:text-base" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
        <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-base-content/65">
          Pas encore de compte ? <Link to="/signup" className="link link-primary font-semibold">Créer un compte</Link>
        </p>
      </section>
    </div>
  );
}
