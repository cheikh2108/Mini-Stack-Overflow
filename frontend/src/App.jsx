
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';


const App = () => {
  // Le Toaster reste global, le layout gère Sidebar/Header, la navigation affiche Home en page d'accueil
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '8px',
            background: '#fff',
            color: '#333',
            fontWeight: 'bold'
          },
          success: {
            style: { background: '#d1fae5', color: '#065f46' }
          },
          error: {
            style: { background: '#fee2e2', color: '#991b1b' }
          }
        }}
      />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Ajoute ici d'autres routes (Ask, Profile, etc.) plus tard */}
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </>
  );
}

export default App