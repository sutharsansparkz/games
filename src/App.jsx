import { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Showcase from './pages/Showcase';
import Admin from './pages/Admin';

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(event) {
      // Option + A (macOS) / Alt + A — matches the physical key so it works
      // even though Option + A produces "å" on macOS.
      if (event.altKey && event.code === 'KeyA') {
        event.preventDefault();
        navigate('/admin');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Showcase />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
