import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Video,
  Smile,
  ImagePlus,
  Mic,
  Send,
  Check,
  CheckCheck,
  Clock,
  Trash2,
  Brain,
} from 'lucide-react';
import { useStore } from '../store/Store';
import Avatar from '../components/Avatar';

const EMOJI_PANEL = ['😀','😂','🥰','😎','🤔','😢','😡','🥺','😴','🤤','😱','🤯','👍','❤️','🔥','🎉','🙏','👏','✨','💯','🌹','☕','🍜','🎂','🐶','🐱','🦋','🌈','⭐','💔'];

export default function ChatPage() {
  const { sessionId, avatarId } = useParams();
  const nav = useNavigate();
  const store = useStore();
  const { state, dispatch } = store;

  // Ensure session exists when starting from avatarId
  useEffect(() => {
    if (avatarId && !sessionId) {
      const avatar = state.avatars.find((a) => a.id === avatarId);
      if (avatar) {
        const existing = state.sessions.find((s) => s.avatarId === avatarId);
        if (existing) {
          nav(`/chat/${existing.id}`, { replace: true });
        } else {
          const sess = store.startNewSession(avatar, state.user || undefined);
          nav(`/chat/${sess.id}`, { replace: true });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarId]);

  const session = sessionId ? state.sessions.find((s) => s.id === sessionId) : state.activeSessionId ? state.sessions.find((s) => s.id === state.activeSessionId) : undefined;
  const avatar = session ? state.avatars.find((a) => a.id === session.avatarId) : undefined;

  useEffect(() => {
    if (session && session.unread > 0) {
      dispatch({ type: 'MARK_READ', sessionId: session.id });
    }
  }, [session?.id]);

  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [session?.messages.length]);

  if (!session || !avatar) {
    return (
      <div className="p-8 text-center">
        <p className="text-ios-label3">对话不存在</p>
        <button className="pill mt-4" onClick={() => nav('/')}>返回首页</button>
      </div>
    );
  }

  const send = () => {
    if (!input.trim()) return;
    const text = input.trim();
    store.sendUserMessage(session.id, text);
    store.sendAiReply(session.id, avatar, text);
    setInput('');
    setShowEmoji(false);
  };

  const sendImage = (url: string) => {
    store.sendUserMessage(session.id, '', { image: url });
    setTimeout(() => {
      store.sendAiReply(session.id, avatar, '（发送了一张图片）');
    }, 800);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const reader = new FileReader();
      reader.onload = () => {
        sendImage(reader.result as string);
      };
      reader.readAsDataURL(f);
    }
  };

  const startVoice = () => {
    const duration = Math.floor(3 + Math.random() * 5);
    store.sendUserMessage(session.id, '', { voice: { duration } });
    setTimeout(() => {
      store.sendAiReply(session.id, avatar, `（语音消息，约 ${duration} 秒）`);
    }, 800);
  };

  const formatTime = (t: number) => {
    const d = new Date(t);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const formatDay = (t: number) => {
    const d = new Date(t);
    const now = new Date();
    const diff = (now.setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 86400000;
    if (diff === 0) return '今天';
    if (diff === 1) return '昨天';
    if (diff < 7) return `${Math.floor(diff)} 天前`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // Create groups separated by day
  const groups: Array<{ day: string; items: typeof session.messages }> = [];
  session.messages.forEach((m) => {
    const day = formatDay(m.time);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(m);
    else groups.push({ day, items: [m] });
  });

  const deleteSession = () => {
    dispatch({ type: 'DELETE_SESSION', sessionId: session.id });
    nav('/chats');
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="glass flex items-center px-3 py-2 safe-top">
        <button
          onClick={() => nav(-1)}
          className="w-10 h-10 -ml-1 flex items-center justify-center rounded-full tap-scale"
        >
          <ArrowLeft size={22} className="text-ios-blue" />
        </button>
        <div className="flex-1 flex items-center gap-2 justify-center">
          <Avatar avatar={avatar} size={32} />
          <div className="text-center leading-tight">
            <div className="font-semibold text-sm text-ios-label">{avatar.name}</div>
            <div className="text-[10px] text-green-500 flex items-center justify-center gap-1">
              <span className="status-dot bg-green-500" /> 在线 · 已启用 AI 记忆
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-10 h-10 flex items-center justify-center rounded-full tap-scale text-ios-blue">
            <Video size={20} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full tap-scale text-ios-blue">
            <Phone size={20} />
          </button>
          <button
            onClick={deleteSession}
            className="w-10 h-10 flex items-center justify-center rounded-full tap-scale text-ios-label3"
            aria-label="删除对话"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 bg-white no-scrollbar"
      >
        {groups.map((g, gi) => (
          <div key={gi}>
            <div className="flex justify-center my-3">
              <span className="text-[11px] text-ios-label3 bg-ios-card2 px-2 py-0.5 rounded-full">
                {g.day}
              </span>
            </div>
            {g.items.map((m, i) => {
              const prev = i > 0 ? g.items[i - 1] : null;
              const showTime = !prev || m.time - prev.time > 300000;
              const isUser = m.role === 'user';
              const isTyping = m.text === '__typing__';
              return (
                <div key={m.id} className="fade-in">
                  {showTime && !isTyping && (
                    <div className={`text-[10px] text-ios-label3 mb-1 ${isUser ? 'text-right' : 'text-center'}`}>
                      {formatTime(m.time)}
                    </div>
                  )}
                  <div className={`flex items-end gap-2 my-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="mb-0.5">
                        <Avatar avatar={avatar} size={28} />
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 max-w-[80%]">
                      {m.image && (
                        <img
                          src={m.image}
                          alt=""
                          className="rounded-2xl max-w-[220px] object-cover"
                        />
                      )}
                      {m.voice && (
                        <div className={`bubble ${isUser ? 'bubble-out' : 'bubble-in'} flex items-center gap-2`}>
                          <Mic size={14} />
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 4 }).map((_, k) => (
                              <span
                                key={k}
                                className="w-0.5 h-3 rounded-full bg-current opacity-80"
                                style={{ height: 4 + k * 3 }}
                              />
                            ))}
                          </div>
                          <span className="text-xs">{m.voice.duration}″</span>
                        </div>
                      )}
                      {m.text && !isTyping && (
                        <div className={`bubble ${isUser ? 'bubble-out' : 'bubble-in'}`}>{m.text}</div>
                      )}
                      {isTyping && (
                        <div className="bubble bubble-in flex items-center gap-1.5 py-3">
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                        </div>
                      )}
                      {isUser && !isTyping && (
                        <div className={`flex items-center gap-1 text-[10px] text-ios-label3 ${isUser ? 'justify-end' : ''}`}>
                          {m.status === 'sending' && <Clock size={10} />}
                          {m.status === 'sent' && <Check size={12} />}
                          {m.status === 'read' && <CheckCheck size={14} />}
                          {m.status === 'read' && <span className="text-ios-label3">已读</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Memory badge */}
      {session.memory.length > 0 && (
        <div className="px-3 py-1 text-[10px] text-ios-label3 bg-ios-card2 flex items-center gap-1 border-t border-ios-separator">
          <Brain size={12} />
          <span className="truncate">AI 记忆：{session.memory.join('；')}</span>
        </div>
      )}

      {/* Emoji panel */}
      {showEmoji && (
        <div className="bg-white border-t border-ios-separator py-2 px-3 grid grid-cols-8 gap-1 fade-in">
          {EMOJI_PANEL.map((e) => (
            <button
              key={e}
              onClick={() => setInput((v) => v + e)}
              className="text-xl py-1 rounded hover:bg-ios-card2 transition-colors"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="input-bar pb-safe">
        <button
          onClick={() => fileRef.current?.click()}
          className="w-9 h-9 rounded-full bg-ios-card2 flex items-center justify-center tap-scale"
        >
          <ImagePlus size={20} className="text-ios-label3" />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        <div className="flex-1 flex items-center gap-1 bg-ios-card2 rounded-full pl-3 pr-1 py-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
            onFocus={() => setShowEmoji(false)}
            className="flex-1 ios-input text-[15px]"
            placeholder="iMessage"
          />
          <button
            onClick={() => setShowEmoji((v) => !v)}
            className="w-8 h-8 rounded-full flex items-center justify-center tap-scale"
          >
            <Smile size={20} className="text-ios-label3" />
          </button>
        </div>
        {input.trim() ? (
          <button
            onClick={send}
            className="w-9 h-9 rounded-full bg-ios-blue text-white flex items-center justify-center tap-scale"
          >
            <Send size={18} />
          </button>
        ) : (
          <button
            onClick={startVoice}
            className="w-9 h-9 rounded-full bg-ios-blue text-white flex items-center justify-center tap-scale"
          >
            <Mic size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
