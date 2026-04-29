// Composant LoginModal : popup moderne pour la connexion
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '../components/Modal';
import { User } from 'lucide-react';
import api from '../lib/api';

export default function LoginModal({ open, onClose, onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
        onClose();
      } else {
        toast.error('Token manquant dans la réponse.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center animate-fade-in">
        <div className="bg-primary/10 rounded-full p-4 mb-2 shadow-lg">
          <User className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-center">Connexion</h2>
        <p className="text-gray-500 mb-4 text-center">Accède à MiniStack pour poser des questions et voter !</p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">Adresse email</span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="exemple@mail.com"
            />
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">Mot de passe</span>
            </label>
            <input
              type="password"
              className="input input-bordered w-full"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <div className="text-center mt-4 text-sm">
          <span className="text-gray-500">Pas encore de compte ? </span>
          <button className="link link-primary font-semibold" type="button" onClick={onSwitch}>
            S'inscrire
          </button>
        </div>
      </div>
    </Modal>
  );
}
