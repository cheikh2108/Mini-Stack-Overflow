
import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Hash, Award } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-bold mb-2">Non connecté</h2>
        <p className="text-gray-500">Veuillez vous connecter pour voir votre profil.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-base-100 rounded-xl shadow-sm border">
      <div className="flex flex-col items-center mb-8 pb-8 border-b">
        <div className="avatar placeholder mb-4">
          <div className="bg-primary text-primary-content rounded-full w-24 ring ring-primary ring-offset-base-100 ring-offset-2">
            <User className="w-12 h-12" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">{user.username}</h1>
        <p className="text-gray-500 flex items-center gap-1 mt-1">
          <Mail className="w-4 h-4" /> {user.email}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
          <Hash className="w-8 h-8 text-primary opacity-70" />
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Identifiant</p>
            <p className="font-mono text-sm break-all">{user.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
          <Award className="w-8 h-8 text-yellow-500 opacity-70" />
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Réputation</p>
            <p className="text-xl font-bold">1</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg md:col-span-2">
          <Calendar className="w-8 h-8 text-blue-500 opacity-70" />
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Membre depuis</p>
            <p className="text-lg">Mars 2024</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Activité récente</h2>
        <div className="bg-base-200 p-8 rounded-lg text-center text-gray-500">
          <p>L'historique des activités sera bientôt disponible.</p>
        </div>
      </div>
    </div>
  );
}
