
import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Hash, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatNumber } from '../lib/format';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  if (!user) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-3xl border border-base-300/70 bg-base-100/85 px-6 py-14 text-center shadow-lg">
        <div className="avatar placeholder mb-4">
          <div className="bg-primary/15 text-primary rounded-full w-20">
            <User className="w-10 h-10" aria-hidden="true" />
          </div>
        </div>
        <h2 className="text-2xl font-black">Profil indisponible</h2>
        <p className="mt-2 text-base-content/65">Connectez-vous pour voir vos données, votre réputation et vos contributions.</p>
        <Link to="/login" className="btn btn-primary mt-6 rounded-2xl">Se connecter</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-base-300/70 bg-base-100/85 p-6 shadow-lg">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-24 ring ring-primary ring-offset-base-100 ring-offset-2">
              <User className="w-12 h-12" aria-hidden="true" />
            </div>
          </div>
          <div className="flex-1">
            <span className="badge badge-primary badge-outline">Profil</span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-balance">{user.username}</h1>
            <p className="mt-2 flex items-center justify-center gap-2 text-base-content/65 md:justify-start">
              <Mail className="w-4 h-4" aria-hidden="true" /> {user.email}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="flex items-center gap-4 rounded-3xl border border-base-300/70 bg-base-100/85 p-5 shadow-sm">
          <Hash className="w-8 h-8 text-primary opacity-70" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-base-content/55">Identifiant</p>
            <p className="mt-1 break-all font-mono text-sm">{user.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border border-base-300/70 bg-base-100/85 p-5 shadow-sm">
          <Award className="w-8 h-8 text-yellow-500 opacity-70" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-base-content/55">Réputation</p>
            <p className="mt-1 text-2xl font-black tabular-nums">{formatNumber(1)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border border-base-300/70 bg-base-100/85 p-5 shadow-sm md:col-span-2 xl:col-span-1">
          <Calendar className="w-8 h-8 text-blue-500 opacity-70" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-base-content/55">Statut</p>
            <p className="mt-1 text-lg font-semibold">Compte local synchronisé</p>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-base-300/70 bg-base-100/85 p-6 shadow-sm">
        <h2 className="text-xl font-bold">Activité récente</h2>
        <div className="mt-4 rounded-2xl bg-base-200/70 p-8 text-center text-base-content/65">
          <p>L’historique des activités sera bientôt disponible.</p>
        </div>
      </section>
    </div>
  );
}
