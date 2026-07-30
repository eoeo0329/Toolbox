import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { StoreProvider } from './store/Store';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import SessionsPage from './pages/SessionsPage';
import CreatePage from './pages/CreatePage';
import AvatarDetailPage from './pages/AvatarDetailPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import BottomNav from './components/BottomNav';
import { useEffect } from 'react';

function PageShell() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const noNavPaths = ['/chat/'];
  const hideNav = noNavPaths.some((p) => location.pathname.startsWith(p));

  return (
    <div className="device-shell">
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/chats" element={<SessionsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/avatar/:id" element={<AvatarDetailPage />} />
            <Route path="/chat/:sessionId" element={<ChatPage />} />
            <Route path="/chat/new/:avatarId" element={<ChatPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <Router>
        <PageShell />
      </Router>
    </StoreProvider>
  );
}

export default App;
