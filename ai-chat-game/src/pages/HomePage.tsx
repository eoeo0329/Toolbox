import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, TrendingUp, UserCircle2, Heart } from 'lucide-react';
import { useStore } from '../store/Store';
import { CATEGORIES } from '../data/avatars';
import CharacterCard from '../components/CharacterCard';
import Avatar from '../components/Avatar';

export default function HomePage() {
  const { state } = useStore();
  const nav = useNavigate();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'recommend' | 'new'>('recommend');
  const [activeCat, setActiveCat] = useState<string>('recommend');

  const filtered = useMemo(() => {
    let list = state.avatars;
    if (tab === 'new') {
      list = [...list].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    } else {
      list = [...list].sort((a, b) => b.chats - a.chats);
    }
    if (activeCat !== 'recommend' && activeCat !== 'new') {
      list = list.filter((a) => a.category === activeCat);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.personality.toLowerCase().includes(q) ||
          a.bio.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [state.avatars, tab, activeCat, query]);

  const featured = state.avatars.filter((a) => a.isFeatured).slice(0, 3);

  return (
    <div className="relative">
      {/* Header */}
      <div className="aurora pb-4 pt-safe sticky top-0 z-30 backdrop-blur-xl">
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[28px] font-bold tracking-tight text-ios-label">Aura</h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-ios-purple/15 text-ios-purple">
                  <Sparkles size={10} /> AI 角色社区
                </span>
              </div>
              <p className="text-xs text-ios-label3 mt-0.5">选择一个 AI，开始你的专属对话</p>
            </div>
            <button
              onClick={() => nav('/profile')}
              className="tap-scale"
              aria-label="个人中心"
            >
              {state.user ? (
                <div className="w-10 h-10 rounded-full grad-1 flex items-center justify-center text-white font-semibold">
                  {state.user.name.slice(0, 1)}
                </div>
              ) : (
                <UserCircle2 size={38} className="text-ios-label3" />
              )}
            </button>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2.5 shadow-inner2">
            <Search size={18} className="text-ios-label3" />
            <input
              className="flex-1 ios-input text-base"
              placeholder="搜索角色、性格或关键词"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="pill text-xs">搜索</button>
          </div>

          {/* Tab switcher */}
          <div className="mt-3 flex items-center gap-3">
            <div className="seg">
              <button className={tab === 'recommend' ? 'active' : ''} onClick={() => setTab('recommend')}>
                推荐
              </button>
              <button className={tab === 'new' ? 'active' : ''} onClick={() => setTab('new')}>
                最新
              </button>
            </div>
            {tab === 'recommend' && (
              <div className="flex items-center gap-1 text-[12px] text-ios-label3">
                <TrendingUp size={14} />
                按热度排序
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="scroll-x mt-3 px-5 flex gap-2 pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            className={`pill flex-shrink-0 ${activeCat === c.id ? 'pill-active' : ''}`}
          >
            <span className="mr-1">{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </div>

      {/* Featured */}
      {activeCat === 'recommend' && tab === 'recommend' && !query && (
        <div className="px-5 mt-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-ios-label">🔥 本周热门</h2>
            <button className="text-xs text-ios-blue" onClick={() => nav('/explore')}>查看全部</button>
          </div>
          <div className="scroll-x flex gap-3 pb-1 -mx-1 px-1">
            {featured.map((a) => (
              <div
                key={a.id}
                onClick={() => nav(`/avatar/${a.id}`)}
                className="card overflow-hidden flex-shrink-0 w-[200px] cursor-pointer fade-in"
              >
                <div className={`${a.gradient} p-3 text-white h-[120px] flex items-end relative`}>
                  <Avatar avatar={a} size={50} rounded="xl" />
                  <div className="absolute top-2 right-2 text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full">
                    🔥 HOT
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-semibold text-sm truncate">{a.name}</div>
                  <div className="text-[11px] text-ios-label3 truncate">{a.personality}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorites quick bar */}
      {state.favorites.length > 0 && (
        <div className="px-5 mt-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-ios-label flex items-center gap-1">
              <Heart size={16} className="text-ios-pink" /> 我收藏的
            </h2>
          </div>
          <div className="scroll-x flex gap-3 pb-1 -mx-1 px-1">
            {state.avatars
              .filter((a) => state.favorites.includes(a.id))
              .map((a) => (
                <button
                  key={a.id}
                  onClick={() => nav(`/avatar/${a.id}`)}
                  className="flex flex-col items-center gap-1 flex-shrink-0"
                >
                  <Avatar avatar={a} size={56} rounded="xl" />
                  <span className="text-[11px] text-ios-label2 truncate w-14 text-center">{a.name}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Waterfall cards */}
      <div className="px-5 mt-5">
        <h2 className="text-base font-semibold text-ios-label mb-3">
          {query ? `"${query}" 的结果` : tab === 'new' ? '🆕 最新上架' : '为你推荐'}
        </h2>
        {filtered.length === 0 ? (
          <div className="card p-8 text-center text-ios-label3 text-sm">
            没有找到匹配的 AI，试试其他关键词吧～
          </div>
        ) : (
          <div className="columns-2 gap-3 [column-fill:_balance]">
            {filtered.map((a) => (
              <div key={a.id} className="mb-3 break-inside-avoid">
                <CharacterCard avatar={a} featured={a.isFeatured} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-6" />
    </div>
  );
}
