
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import AskQuestion from './pages/AskQuestion';
import Login from './pages/Login';
import Signup from './pages/Signup';
import QuestionDetail from './pages/QuestionDetail';
import Profile from './pages/Profile';


const App = () => {
  // Le Toaster reste global, le layout gère Sidebar/Header, la navigation affiche Home en page d'accueil
  return (
    <>
      <Toaster
        position="top-right"
        gutter={12}
        toastOptions={{
          style: {
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#111827',
            fontWeight: 600,
            border: '1px solid rgba(148, 163, 184, 0.25)',
            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)'
          },
          success: {
            style: { background: '#ecfdf5', color: '#065f46' }
          },
          error: {
            style: { background: '#fef2f2', color: '#991b1b' }
          }
        }}
      />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ask" element={<AskQuestion />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/questions/:id" element={<QuestionDetail />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </>
  );
}

export default App