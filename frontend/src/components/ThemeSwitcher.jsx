// Composant pour basculer entre le thème clair (winter) et sombre (business) avec DaisyUI

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react'; // Icônes modernes

const THEMES = {
  light: 'winter',
  dark: 'business',
};

export default function ThemeSwitcher() {
  // State pour le thème courant ("light" ou "dark")
  const [theme, setTheme] = useState(() => {
    // Essaie de récupérer le thème sauvegardé en localStorage, sinon "light"
    return localStorage.getItem('theme') || 'light';
  });

  // Applique le thème à la balise <html> à chaque changement
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', THEMES[theme]);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Bascule le thème
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <button
      className="btn btn-ghost btn-circle"
      onClick={toggleTheme}
      aria-label="Changer le thème"
      title={theme === 'light' ? 'Passer en mode sombre' : 'Passer en mode clair'}
    >
      {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  );
}
