import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <a
        href="#main-content"
        className="sr-only rounded-full bg-base-100 px-4 py-2 text-sm font-semibold text-primary shadow focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60]"
      >
        Aller au contenu
      </a>
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Desktop Sidebar - Always visible on lg+ */}
        <div className="hidden lg:block">
          <Sidebar isDrawer={false} />
        </div>

        {/* Mobile/Tablet Sidebar Drawer */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-30 bg-black/50 animate-fade-in lg:hidden"
              onClick={() => setSidebarOpen(false)}
              role="presentation"
            />
            {/* Drawer Panel */}
            <div className="fixed inset-y-16 left-0 z-40 w-80 animate-slide-in-left lg:hidden">
              <Sidebar isDrawer onClose={() => setSidebarOpen(false)} />
            </div>
          </>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <Header onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
          <main id="main-content" className="flex-1 px-4 py-6 md:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
