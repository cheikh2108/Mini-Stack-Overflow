// Page d'inscription utilisateur (signup)
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', {
        username,
        email,
        password
      });
      toast.success('Inscription réussie ! Connectez-vous.');
      navigate('/login');
    } catch {
      toast.error("Erreur lors de l'inscription. Email ou pseudo déjà pris ?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
      <section className="rounded-2xl sm:rounded-3xl border border-base-300/70 bg-base-100/85 p-4 sm:p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <span className="badge badge-secondary badge-outline mb-3 sm:mb-4 text-xs sm:text-sm">Inscription</span>
        <h1 className="text-2xl sm:text-3xl lg:text-3xl font-black tracking-tight text-balance">Rejoignez la conversation.</h1>
        <p className="mt-2 sm:mt-3 max-w-xl text-sm sm:text-base text-base-content/70">Créez un compte pour poser vos questions, répondre aux autres et suivre votre progression.</p>
        <div className="mt-6 sm:mt-8 rounded-xl sm:rounded-2xl bg-base-200/70 p-3 sm:p-5 transition-transform hover:scale-105 duration-300">
          <p className="text-sm sm:text-base font-semibold">Pourquoi créer un compte ?</p>
          <ul className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-base-content/70">
            <li>✓ Sauvegarder votre profil et vos contributions.</li>
            <li>✓ Voter et accepter les réponses utiles.</li>
            <li>✓ Poser des questions plus facilement depuis mobile ou desktop.</li>
          </ul>
        </div>
      </section>

      <section className="rounded-2xl sm:rounded-3xl border border-base-300/70 bg-base-100/85 p-4 sm:p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <h2 className="text-xl sm:text-2xl font-bold">Inscription</h2>
        <form onSubmit={handleSubmit} className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="signup-username" className="mb-1.5 sm:mb-2 block text-sm sm:text-base font-semibold">Nom d'utilisateur</label>
            <input
              id="signup-username"
              name="username"
              type="text"
              autoComplete="username"
              spellCheck={false}
              className="input input-bordered w-full rounded-xl sm:rounded-2xl border-base-300/70 text-sm sm:text-base h-10 sm:h-11 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="signup-email" className="mb-1.5 sm:mb-2 block text-sm sm:text-base font-semibold">Adresse email</label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-password" className="mb-1.5 sm:mb-2 block text-sm sm:text-base font-semibold">Mot de passe</label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="input input-bordered w-full rounded-xl sm:rounded-2xl border-base-300/70 text-sm sm:text-base h-10 sm:h-11 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 h-10 sm:h-11 text-sm sm:text-base" disabled={loading}>
            {loading ? 'Inscription…' : "S'inscrire"}
          </button>
        </form>
        <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-base-content/65">
          Déjà un compte ? <Link to="/login" className="link link-primary font-semibold">Se connecter</Link>
        </p>
      </section>
    </div>
  );
}
