import { useNavigate } from 'react-router-dom';
import type { AIAvatar } from '../types';
import Avatar from './Avatar';
import { Eye, MessageCircle, Sparkles } from 'lucide-react';
import { useStore } from '../store/Store';

interface Props {
  avatar: AIAvatar;
  featured?: boolean;
}

export default function CharacterCard({ avatar, featured }: Props) {
  const nav = useNavigate();
  const { state, dispatch } = useStore();
  const fav = state.favorites.includes(avatar.id);

  const openAvatar = () => nav(`/avatar/${avatar.id}`);

  const startChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    nav(`/chat/new/${avatar.id}`);
  };

  const toggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_FAVORITE', avatarId: avatar.id });
  };

  // Variable height based on name length to create waterfall effect
  const nameLen = avatar.name.length + avatar.personality.length;
  const variableHeight = 180 + (nameLen % 4) * 24;

  return (
    <div
      onClick={openAvatar}
      className="card overflow-hidden cursor-pointer fade-in"
      style={{ minHeight: variableHeight }}
    >
      <div
        className={`relative ${avatar.gradient} p-4 text-white`}
        style={{ height: Math.max(120, variableHeight - 100) }}
      >
        <div className="flex justify-between items-start">
          {avatar.isNew && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/25 backdrop-blur">
              <Sparkles size={10} /> NEW
            </span>
          )}
          {featured && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/25 backdrop-blur">
              🔥 热门
            </span>
          )}
          <button
            onClick={toggleFav}
            className="ml-auto w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center tap-scale"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={fav ? '#FF375F' : 'none'} stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        <div className="absolute left-4 bottom-3 right-4 flex items-end gap-2">
          <Avatar avatar={avatar} size={48} rounded="xl" />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg leading-tight truncate">{avatar.name}</div>
            <div className="text-[11px] opacity-90 truncate">{avatar.personality}</div>
          </div>
        </div>
      </div>

      <div className="p-3">
        <p className="text-xs text-ios-label2 line-clamp-2 leading-snug mb-2 min-h-[32px]">
          {avatar.description}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-ios-label3 mb-2 flex-wrap">
          {avatar.age > 0 && <span>{avatar.age} 岁</span>}
          {avatar.height && <span>· {avatar.height}</span>}
          <span className="ml-auto flex items-center gap-0.5">
            <Eye size={10} /> {avatar.views}
          </span>
          <span className="flex items-center gap-0.5">
            <MessageCircle size={10} /> {avatar.chats}
          </span>
        </div>
        <button
          onClick={startChat}
          className="w-full py-2 rounded-full bg-ios-blue text-white text-sm font-semibold tap-scale flex items-center justify-center gap-1"
        >
          <MessageCircle size={14} />
          开始对话
        </button>
      </div>
    </div>
  );
}
