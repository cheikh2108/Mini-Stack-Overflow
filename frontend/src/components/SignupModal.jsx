// Composant SignupModal : popup moderne pour l'inscription
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Modal from '../components/Modal';
import { UserPlus } from 'lucide-react';

export default function SignupModal({ open, onClose, onSwitch }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:3001/api/auth/register', {
        username,
        email,
        password
      });
      toast.success('Inscription réussie ! Connectez-vous.');
      onSwitch();
    } catch {
      toast.error("Erreur lors de l'inscription. Email ou pseudo déjà pris ?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center animate-fade-in">
        <div className="bg-primary/10 rounded-full p-4 mb-2 shadow-lg">
          <UserPlus className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-center">Créer un compte</h2>
        <p className="text-gray-500 mb-4 text-center">Rejoins MiniStack pour poser des questions et voter !</p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">Nom d'utilisateur</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
              placeholder="Votre pseudo"
            />
          </div>
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
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>
        <div className="text-center mt-4 text-sm">
          <span className="text-gray-500">Déjà un compte ? </span>
          <button className="link link-primary font-semibold" type="button" onClick={onSwitch}>
            Se connecter
          </button>
        </div>
      </div>
    </Modal>
  );
}
