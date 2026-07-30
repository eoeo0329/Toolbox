import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import HomePage from './pages/HomePage';
import MatchPage from './pages/MatchPage';
import ChatPage from './pages/ChatPage';
import JudgePage from './pages/JudgePage';
import ResultPage from './pages/ResultPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import MusicPage from './pages/MusicPage';
import './index.css';

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/match" element={<MatchPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/judge" element={<JudgePage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/music" element={<MusicPage />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;