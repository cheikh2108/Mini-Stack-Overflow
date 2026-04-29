import { Home, LayoutDashboard, Server, Smartphone, Database, Code, Globe, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../lib/api';
import { formatNumber } from '../lib/format';

const categories = [
  { name: 'Toutes les questions', icon: Home, path: '/' },
  { name: 'Frontend', icon: LayoutDashboard, path: '/?tag=Frontend' },
  { name: 'Backend', icon: Server, path: '/?tag=Backend' },
  { name: 'Mobile', icon: Smartphone, path: '/?tag=Mobile' },
  { name: 'Base de données', icon: Database, path: '/?tag=Database' },
  { name: 'DevOps', icon: Code, path: '/?tag=DevOps' },
  { name: 'Web', icon: Globe, path: '/?tag=Web' },
];

export default function Sidebar({ isDrawer = false, onClose }) {
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState({ total: 0, resolution: 0, actifs: 0 });
  const location = useLocation();

  useEffect(() => {
    api.get('/tags')
      .then(res => setTags(res.data.tags || []))
      .catch(() => setTags([]));
    api.get('/stats')
      .then(res => setStats(res.data))
      .catch(() => setStats({ total: 0, resolution: 0, actifs: 0 }));
  }, []);

  const pathname = location.pathname + location.search;

  const sidebarContent = (
    <>
      {/* Header du drawer (mobile) */}
      {isDrawer && (
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-base-300/70 bg-base-100 px-4 py-3">
          <h2 className="font-bold text-base">Catégories & Tags</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm touch-target"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}

      <div className={`flex h-full flex-col gap-4 overflow-y-auto ${isDrawer ? 'p-3' : 'gap-6 p-4 md:p-6'}`}>
        {/* Intro Card - Hidden on mobile drawer */}
        {!isDrawer && (
          <div className="rounded-3xl border border-base-300/70 bg-base-100/80 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">MiniStack</p>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-balance">Questions, réponses & idées utiles.</h1>
                <p className="mt-2 text-sm text-base-content/65">Explorez les sujets, trouvez des réponses rapides et partagez votre expertise.</p>
              </div>
              <span className="badge badge-primary badge-outline flex-shrink-0">Live</span>
            </div>
          </div>
        )}

        {/* Navigation Categories */}
        <nav>
          <ul className={isDrawer ? 'space-y-2' : 'grid gap-2 sm:grid-cols-2 lg:grid-cols-1'}>
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = pathname === cat.path;
              return (
                <li key={cat.name}>
                  <Link
                    to={cat.path}
                    onClick={() => isDrawer && onClose?.()}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                      isActive
                        ? 'border-primary/30 bg-primary/10 text-primary shadow-sm'
                        : 'border-transparent bg-base-200/60 text-base-content/75 hover:border-base-300 hover:bg-base-200'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <span>{cat.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Tags Section */}
        <section className={`rounded-2xl border border-base-300/70 bg-base-100/80 p-4 shadow-sm ${isDrawer ? 'rounded-xl' : ''}`}>
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="font-semibold text-sm">Tags populaires</h2>
            <span className="text-xs text-base-content/55">{formatNumber(tags.length)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Link
                key={tag.id}
                to={`/?tag=${encodeURIComponent(tag.name)}`}
                onClick={() => isDrawer && onClose?.()}
                className="tag-badge inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                style={{ background: tag.color, color: '#fff' }}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className={`grid gap-2 rounded-2xl border border-base-300/70 bg-base-100/80 p-4 shadow-sm ${isDrawer ? 'grid-cols-3 rounded-xl' : 'grid-cols-3'}`}>
          <div className="rounded-lg bg-base-200/70 p-3 text-center">
            <div className="text-lg font-black tabular-nums">{formatNumber(stats.total)}</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-base-content/55">Questions</div>
          </div>
          <div className="rounded-lg bg-base-200/70 p-3 text-center">
            <div className="text-lg font-black tabular-nums">{stats.resolution}%</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-base-content/55">Résolution</div>
          </div>
          <div className="rounded-lg bg-base-200/70 p-3 text-center">
            <div className="text-lg font-black tabular-nums">{formatNumber(stats.actifs)}</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-base-content/55">Tags</div>
          </div>
        </section>
      </div>
    </>
  );

  // Desktop Sidebar (fixed)
  if (!isDrawer) {
    return (
      <aside className="w-full border-b border-base-300/70 bg-base-100/90 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-80 lg:shrink-0 lg:border-b-0 lg:border-r">
        {sidebarContent}
      </aside>
    );
  }

  // Mobile Drawer
  return (
    <aside className="h-screen w-full bg-base-100 flex flex-col overflow-hidden">
      {sidebarContent}
    </aside>
  );
}
