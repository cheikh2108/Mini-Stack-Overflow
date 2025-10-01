// frontend/src/layouts/MainLayout.jsx
// Layout principal : Sidebar à gauche, Header en haut, contenu au centre
// Place ce fichier dans frontend/src/layouts/
// Utilise DaisyUI/Tailwind pour le style

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-base-200">
      {/* Sidebar à gauche */}
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header en haut */}
        <Header />
        {/* Contenu principal */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
