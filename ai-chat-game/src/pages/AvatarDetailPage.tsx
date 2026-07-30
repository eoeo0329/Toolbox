import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MoreHorizontal, MessageCircle, Eye, Sparkles } from 'lucide-react';
import { useStore } from '../store/Store';
import Avatar from '../components/Avatar';

export default function AvatarDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { state, dispatch } = useStore();
  const avatar = state.avatars.find((a) => a.id === id);

  if (!avatar) {
    return (
      <div className="p-8 text-center">
        <p className="text-ios-label3">找不到这个 AI 角色</p>
        <button className="pill mt-4" onClick={() => nav(-1)}>返回</button>
      </div>
    );
  }

  const fav = state.favorites.includes(avatar.id);
  const startChat = () => nav(`/chat/new/${avatar.id}`);

  return (
    <div>
      {/* Cover */}
      <div className={`relative ${avatar.gradient} pt-safe pb-20 px-5 text-white`}>
        <div className="flex items-center justify-between">
          <button onClick={() => nav(-1)} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center tap-scale">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center tap-scale">
              <Share2 size={18} />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center tap-scale">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center mt-4">
          <Avatar avatar={avatar} size={96} rounded="xl" />
          <h1 className="text-2xl font-bold mt-3">{avatar.name}</h1>
          <p className="text-sm opacity-90 mt-1">{avatar.personality}</p>
          <div className="flex gap-1.5 mt-3 flex-wrap justify-center px-6">
            {avatar.tags.map((t) => (
              <span key={t} className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full backdrop-blur">
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Body card */}
      <div className="px-5 -mt-12 relative z-10">
        <div className="card p-5">
          <div className="flex gap-4 items-center">
            <div className="flex-1 text-center">
              <div className="text-lg font-semibold text-ios-label">{avatar.chats}</div>
              <div className="text-[11px] text-ios-label3">对话</div>
            </div>
            <div className="w-px h-10 bg-ios-separator" />
            <div className="flex-1 text-center">
              <div className="text-lg font-semibold text-ios-label">{avatar.views}</div>
              <div className="text-[11px] text-ios-label3"><Eye size={10} className="inline mr-0.5" /> 浏览</div>
            </div>
            <div className="w-px h-10 bg-ios-separator" />
            <div className="flex-1 text-center">
              <div className="text-lg font-semibold text-ios-label">{avatar.age}</div>
              <div className="text-[11px] text-ios-label3">设定年龄</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-ios-separator text-sm text-ios-label2 leading-relaxed">
            {avatar.description}
          </div>
          <div className="mt-4 text-[12px] text-ios-label3">
            <span>创建者：{avatar.creator}</span>
            {avatar.height && <span className="ml-3">身高：{avatar.height}</span>}
          </div>
        </div>

        {/* Sample lines */}
        <div className="card mt-4 p-5">
          <h3 className="text-sm font-semibold text-ios-label mb-3 flex items-center gap-1">
            <Sparkles size={14} className="text-ios-purple" /> 会说的话
          </h3>
          <div className="space-y-2">
            {avatar.sampleReplies.map((r, i) => (
              <div key={i} className="text-sm text-ios-label2 bg-ios-card2 rounded-xl p-3">
                <span className="text-ios-purple mr-1">"{r}"</span>
              </div>
            ))}
          </div>
        </div>

        {/* Memory intro */}
        <div className="card mt-4 p-5">
          <h3 className="text-sm font-semibold text-ios-label mb-2 flex items-center gap-1">
            🧠 AI 记忆功能
          </h3>
          <p className="text-xs text-ios-label2 leading-relaxed">
            {avatar.name} 会在对话中记住你的名字、喜好和重要信息，下次对话时依然记得你。所有记忆仅保存在本机。
          </p>
        </div>

        {/* Action buttons */}
        <div className="fixed bottom-[70px] left-0 right-0 z-30 pb-safe px-5 pointer-events-none">
          <div className="max-w-[430px] mx-auto flex gap-2 pointer-events-auto glass-strong rounded-full p-2">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', avatarId: avatar.id })}
              className={`flex-1 py-3 rounded-full font-semibold text-sm flex items-center justify-center gap-1 tap-scale ${
                fav ? 'bg-ios-pink text-white' : 'bg-ios-card2 text-ios-label2'
              }`}
            >
              <Heart size={16} fill={fav ? 'white' : 'none'} />
              {fav ? '已收藏' : '收藏'}
            </button>
            <button
              onClick={startChat}
              className="flex-1 py-3 rounded-full bg-ios-blue text-white font-semibold text-sm flex items-center justify-center gap-1 tap-scale"
            >
              <MessageCircle size={16} /> 开始对话
            </button>
          </div>
        </div>
      </div>

      <div className="h-32" />
    </div>
  );
}
