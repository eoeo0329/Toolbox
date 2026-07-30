import { useNavigate } from 'react-router-dom';
import { UserCircle2, MessageCircle, Settings, Edit3, Sparkles, ChevronRight, Camera } from 'lucide-react';
import { useStore } from '../store/Store';
import Avatar from '../components/Avatar';

export default function ProfilePage() {
  const { state } = useStore();
  const nav = useNavigate();

  const favs = state.avatars.filter((a) => state.favorites.includes(a.id));
  const mySessions = state.sessions;

  return (
    <div>
      {/* Header */}
      <div className="aurora pt-safe pb-6 px-5">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-[22px] font-bold text-ios-label">我的</h1>
          <button
            onClick={() => nav('/settings')}
            className="w-9 h-9 rounded-full bg-white shadow-inner2 flex items-center justify-center tap-scale"
          >
            <Settings size={18} className="text-ios-label3" />
          </button>
        </div>

        {state.user ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-[72px] h-[72px] rounded-full grad-1 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {state.user.name.slice(0, 1)}
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-ios-blue flex items-center justify-center text-white shadow-md">
                <Camera size={14} />
              </button>
            </div>
            <div>
              <div className="text-xl font-bold text-ios-label">{state.user.name}</div>
              <div className="text-xs text-ios-label3">{state.user.email || '未绑定邮箱'}</div>
              <div className="text-[11px] text-ios-label3 mt-0.5">{state.user.bio || '这个人很懒，什么都没写'}</div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => nav('/login')}
            className="flex items-center gap-3 cursor-pointer tap-scale"
          >
            <div className="w-[72px] h-[72px] rounded-full bg-white shadow-inner2 flex items-center justify-center">
              <UserCircle2 size={50} className="text-ios-label3" />
            </div>
            <div>
              <div className="text-xl font-bold text-ios-label">点击登录</div>
              <div className="text-xs text-ios-label3">登录后可以同步收藏和对话</div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="card py-3 text-center">
            <div className="text-xl font-bold">{favs.length}</div>
            <div className="text-[11px] text-ios-label3">收藏</div>
          </div>
          <div className="card py-3 text-center">
            <div className="text-xl font-bold">{mySessions.length}</div>
            <div className="text-[11px] text-ios-label3">对话</div>
          </div>
          <div className="card py-3 text-center">
            <div className="text-xl font-bold">{state.avatars.filter((a) => a.custom).length}</div>
            <div className="text-[11px] text-ios-label3">自创 AI</div>
          </div>
        </div>
      </div>

      {/* Menu list */}
      <div className="px-5 mt-4 space-y-4">
        <div className="cell-group">
          <div
            className="cell cursor-pointer"
            onClick={() => nav('/chats')}
          >
            <div className="w-9 h-9 rounded-lg grad-5 flex items-center justify-center text-white">
              <MessageCircle size={18} />
            </div>
            <div className="flex-1 font-medium text-ios-label">对话历史</div>
            {state.sessions.some((s) => s.unread > 0) && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-ios-pink text-white text-[10px] font-bold flex items-center justify-center">
                {state.sessions.reduce((acc, s) => acc + s.unread, 0)}
              </span>
            )}
            <ChevronRight size={16} className="text-ios-label3" />
          </div>
          <div
            className="cell cursor-pointer"
            onClick={() => nav('/create')}
          >
            <div className="w-9 h-9 rounded-lg grad-4 flex items-center justify-center text-white">
              <Edit3 size={16} />
            </div>
            <div className="flex-1 font-medium text-ios-label">创建 AI 角色</div>
            <Sparkles size={14} className="text-ios-label3" />
            <ChevronRight size={16} className="text-ios-label3" />
          </div>
          <div
            className="cell cursor-pointer"
            onClick={() => nav('/settings')}
          >
            <div className="w-9 h-9 rounded-lg grad-3 flex items-center justify-center text-white">
              <Settings size={16} />
            </div>
            <div className="flex-1 font-medium text-ios-label">设置</div>
            <ChevronRight size={16} className="text-ios-label3" />
          </div>
        </div>

        {/* Favorites */}
        {favs.length > 0 && (
          <div>
            <h3 className="text-xs text-ios-label3 mb-2 px-1">我收藏的 AI</h3>
            <div className="card p-3 flex gap-3 overflow-x-auto scroll-x">
              {favs.map((a) => (
                <button
                  key={a.id}
                  onClick={() => nav(`/avatar/${a.id}`)}
                  className="flex flex-col items-center gap-1 flex-shrink-0 tap-scale"
                >
                  <Avatar avatar={a} size={56} rounded="xl" />
                  <span className="text-[11px] text-ios-label2 w-16 truncate text-center">{a.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Memory */}
        {state.sessions.filter((s) => s.memory.length > 0).length > 0 && (
          <div>
            <h3 className="text-xs text-ios-label3 mb-2 px-1">AI 记忆</h3>
            <div className="space-y-2">
              {state.sessions
                .filter((s) => s.memory.length > 0)
                .slice(0, 3)
                .map((s) => {
                  const a = state.avatars.find((av) => av.id === s.avatarId);
                  if (!a) return null;
                  return (
                    <div key={s.id} className="card p-3 flex items-start gap-3">
                      <Avatar avatar={a} size={36} rounded="xl" />
                      <div className="flex-1 text-xs text-ios-label2">
                        <div className="font-semibold text-ios-label mb-1">{a.name} 记得：</div>
                        <div className="line-clamp-2">{s.memory.join('；')}</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {state.user && (
          <button
            onClick={() => {
              if (confirm('确定要退出登录吗？')) {
                useStore; // stub
                // Can't use hook here, use the dispatch via window
                localStorage.removeItem('aura_chat_state_v1');
                location.reload();
              }
            }}
            className="w-full py-3 rounded-full bg-white text-ios-red font-semibold text-sm tap-scale shadow-inner2"
          >
            退出登录
          </button>
        )}
      </div>

      <div className="h-6" />
    </div>
  );
}
