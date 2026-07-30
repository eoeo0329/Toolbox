import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useStore } from '../store/Store';
import { CATEGORIES } from '../data/avatars';
import CharacterCard from '../components/CharacterCard';

export default function ExplorePage() {
  const { state } = useStore();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');

  const list = useMemo(() => {
    let l = state.avatars;
    if (cat !== 'all') l = l.filter((a) => a.category === cat);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      l = l.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.bio.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return [...l].sort((a, b) => b.chats - a.chats);
  }, [state.avatars, query, cat]);

  return (
    <div>
      <div className="aurora sticky top-0 z-30 pt-safe pb-3 backdrop-blur-xl">
        <div className="px-5 pt-4">
          <h1 className="text-[22px] font-bold text-ios-label mb-3">发现</h1>
          <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2.5 shadow-inner2">
            <Search size={18} className="text-ios-label3" />
            <input
              className="flex-1 ios-input text-base"
              placeholder="搜索 AI 角色"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="scroll-x mt-3 flex gap-2 pb-1">
            <button
              onClick={() => setCat('all')}
              className={`pill flex-shrink-0 ${cat === 'all' ? 'pill-active' : ''}`}
            >
              全部
            </button>
            {CATEGORIES.filter((c) => c.id !== 'recommend' && c.id !== 'new').map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`pill flex-shrink-0 ${cat === c.id ? 'pill-active' : ''}`}
              >
                <span className="mr-1">{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 mt-4">
        {list.length === 0 ? (
          <div className="card p-8 text-center text-ios-label3 text-sm">暂无结果</div>
        ) : (
          <div className="columns-2 gap-3 [column-fill:_balance]">
            {list.map((a) => (
              <div key={a.id} className="mb-3 break-inside-avoid">
                <CharacterCard avatar={a} />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="h-6" />
    </div>
  );
}
