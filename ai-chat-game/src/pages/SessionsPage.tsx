import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store/Store';
import Avatar from '../components/Avatar';
import { useState } from 'react';

export default function SessionsPage() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const [query, setQuery] = useState('');

  const sessions = state.sessions
    .filter((s) => {
      if (!query.trim()) return true;
      const a = state.avatars.find((av) => av.id === s.avatarId);
      return (
        a?.name.toLowerCase().includes(query.toLowerCase()) ||
        s.messages.some((m) => m.text?.toLowerCase().includes(query.toLowerCase()))
      );
    })
    .sort((a, b) => b.lastTime - a.lastTime);

  const formatTime = (t: number) => {
    const d = new Date(t);
    const now = new Date();
    const diff = (now.setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 86400000;
    if (diff === 0) {
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
    if (diff === 1) return '昨天';
    if (diff < 7) return `${Math.floor(diff)} 天前`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const preview = (s: typeof sessions[number]) => {
    const last = [...s.messages].reverse().find((m) => m.text !== '__typing__');
    if (!last) return '开始一段对话';
    if (last.image) return '[图片]';
    if (last.voice) return `[语音 ${last.voice.duration}″]`;
    return (last.text || '').slice(0, 28);
  };

  return (
    <div>
      <div className="aurora sticky top-0 z-30 pt-safe pb-3 backdrop-blur-xl">
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-[22px] font-bold text-ios-label">对话</h1>
            <button
              onClick={() => nav('/')}
              className="w-9 h-9 rounded-full bg-white shadow-inner2 flex items-center justify-center tap-scale"
              aria-label="新建"
            >
              <Plus size={20} className="text-ios-blue" />
            </button>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2.5 shadow-inner2">
            <Search size={18} className="text-ios-label3" />
            <input
              className="flex-1 ios-input text-base"
              placeholder="搜索对话"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <div className="w-20 h-20 rounded-full grad-1 mx-auto flex items-center justify-center text-3xl mb-4">
            💬
          </div>
          <h3 className="font-semibold text-ios-label mb-1">还没有对话</h3>
          <p className="text-sm text-ios-label3 mb-5">选择一个 AI 角色，开始你的第一次对话</p>
          <button
            onClick={() => nav('/')}
            className="px-6 py-3 rounded-full bg-ios-blue text-white font-semibold text-sm"
          >
            去发现 AI
          </button>
        </div>
      ) : (
        <div className="divide-y divide-ios-separator/60">
          {sessions.map((s) => {
            const a = state.avatars.find((av) => av.id === s.avatarId);
            if (!a) return null;
            return (
              <div
                key={s.id}
                onClick={() => nav(`/chat/${s.id}`)}
                className="px-4 py-3 flex items-center gap-3 bg-white tap-scale cursor-pointer"
              >
                <div className="relative">
                  <Avatar avatar={a} size={50} rounded="xl" />
                  {s.unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-ios-pink text-white text-[10px] font-bold flex items-center justify-center">
                      {s.unread > 9 ? '9+' : s.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-ios-label truncate">{a.name}</div>
                    <div className="text-[11px] text-ios-label3">{formatTime(s.lastTime)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] text-ios-label3 truncate">{preview(s)}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: 'DELETE_SESSION', sessionId: s.id });
                      }}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-ios-label3"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="h-6" />
    </div>
  );
}
