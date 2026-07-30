import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';
import { useStore } from '../store/Store';
import type { AIAvatar } from '../types';
import { CATEGORIES } from '../data/avatars';

const GRADIENTS = ['grad-1','grad-2','grad-3','grad-4','grad-5','grad-6','grad-7','grad-8','grad-9','grad-10'];
const EMOJIS = ['🌸','🌊','⭐','🩺','🌼','🌙','💻','💪','🎧','🍜','✈️','😎','🥰','🦊','🐱','🌹'];

export default function CreatePage() {
  const nav = useNavigate();
  const { dispatch } = useStore();

  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('');
  const [bio, setBio] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('love');
  const [gender, setGender] = useState<'female' | 'male' | 'other'>('female');
  const [age, setAge] = useState(22);
  const [height, setHeight] = useState('165cm');
  const [emoji, setEmoji] = useState('🌸');
  const [gradient, setGradient] = useState('grad-4');

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [reply1, setReply1] = useState('');
  const [reply2, setReply2] = useState('');
  const [reply3, setReply3] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const randomize = () => {
    setGradient(GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]);
    setEmoji(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
  };

  const canSubmit = name && personality && description;

  const submit = () => {
    if (!canSubmit) return;
    const avatar: AIAvatar = {
      id: 'custom_' + Date.now(),
      name: name.trim(),
      personality: personality.trim(),
      bio: bio.trim() || '自定义 AI 角色',
      description: description.trim(),
      category,
      tags: tags.length ? tags : [personality.trim()],
      gender,
      age,
      height,
      creator: '@我',
      views: 0,
      chats: 0,
      gradient,
      emoji,
      sampleReplies: [
        reply1.trim() || `你好，我是 ${name}。很高兴认识你。`,
        reply2.trim() || '嗯，我在听。你愿意多说说吗？',
        reply3.trim() || '无论发生什么，我都会陪着你。',
      ],
      custom: true,
    };
    dispatch({ type: 'ADD_AVATAR', payload: avatar });
    nav(`/avatar/${avatar.id}`);
  };

  return (
    <div>
      <div className="glass pt-safe sticky top-0 z-30">
        <div className="flex items-center justify-between px-3 py-2">
          <button
            onClick={() => nav(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center tap-scale"
          >
            <ArrowLeft size={22} className="text-ios-blue" />
          </button>
          <h1 className="text-base font-semibold text-ios-label">创建 AI 角色</h1>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className={`px-4 py-1.5 rounded-full font-semibold text-sm tap-scale ${
              canSubmit ? 'bg-ios-blue text-white' : 'bg-ios-separator text-ios-label3'
            }`}
          >
            创建
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Preview */}
        <div className="card p-4 flex items-center gap-3">
          <div className={`${gradient} w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl shadow-inner2`}>
            {emoji}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-ios-label">{name || '未命名 AI'}</div>
            <div className="text-xs text-ios-label3">{personality || '设定性格标签'}</div>
          </div>
          <button onClick={randomize} className="pill text-xs flex items-center gap-1">
            <RefreshCw size={12} /> 随机
          </button>
        </div>

        {/* Avatar color + emoji */}
        <div className="card p-4 space-y-3">
          <div>
            <div className="text-xs text-ios-label3 mb-2">选择头像颜色</div>
            <div className="flex gap-2 flex-wrap">
              {GRADIENTS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGradient(g)}
                  className={`w-9 h-9 rounded-full ${g} ${gradient === g ? 'ring-2 ring-offset-2 ring-ios-blue' : ''}`}
                />
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-ios-label3 mb-2">选择头像表情</div>
            <div className="flex gap-1 flex-wrap">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center ${
                    emoji === e ? 'bg-ios-blue/15 ring-1 ring-ios-blue' : 'bg-ios-card2'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Basic info */}
        <div className="card p-4 space-y-3">
          <Field label="名字 *" placeholder="例如：星辰" value={name} onChange={setName} />
          <Field label="性格标签 *" placeholder="例如：温柔治愈 · 倾听者" value={personality} onChange={setPersonality} />
          <Field label="简介" placeholder="一句话介绍这个角色" value={bio} onChange={setBio} />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="详细描述：背景故事、说话风格、性格特点..."
            rows={4}
            className="w-full bg-ios-card2 rounded-xl p-3 text-sm ios-input resize-none"
          />
        </div>

        {/* Category + settings */}
        <div className="card p-4 space-y-3">
          <div>
            <div className="text-xs text-ios-label3 mb-2">分类</div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c.id !== 'recommend' && c.id !== 'new').map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`pill ${category === c.id ? 'pill-active' : ''}`}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-ios-label3 mb-2">性别</div>
            <div className="flex gap-2">
              {(['female','male','other'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                    gender === g ? 'bg-ios-blue text-white' : 'bg-ios-card2 text-ios-label2'
                  }`}
                >
                  {g === 'female' ? '女' : g === 'male' ? '男' : '其他'}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-ios-label3 mb-1">年龄：{age} 岁</div>
              <input
                type="range"
                min={1}
                max={60}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-ios-blue"
              />
            </div>
            <Field label="身高" placeholder="165cm" value={height} onChange={setHeight} />
          </div>
        </div>

        {/* Tags */}
        <div className="card p-4">
          <div className="text-xs text-ios-label3 mb-2">标签</div>
          <div className="flex gap-2 mb-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              placeholder="输入后回车添加"
              className="flex-1 bg-ios-card2 rounded-xl px-3 py-2 text-sm ios-input"
            />
            <button onClick={addTag} className="pill">添加</button>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-ios-blue/10 text-ios-blue text-xs"
              >
                #{t}
                <button onClick={() => setTags(tags.filter((x) => x !== t))}>×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Sample replies */}
        <div className="card p-4 space-y-3">
          <div className="flex items-center gap-1 text-xs text-ios-label3">
            <Sparkles size={12} /> 设定 3 句经典对白（引导 AI 说话风格）
          </div>
          <Field label="对白 1" placeholder="你好，我是..." value={reply1} onChange={setReply1} />
          <Field label="对白 2" placeholder="嗯，我在听..." value={reply2} onChange={setReply2} />
          <Field label="对白 3" placeholder="无论发生什么..." value={reply3} onChange={setReply3} />
        </div>

        <div className="text-[11px] text-ios-label3 text-center">
          创建后可在首页或"我的"页面找到你自定义的 AI 角色
        </div>
        <div className="h-6" />
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-xs text-ios-label3 mb-1">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-ios-card2 rounded-xl px-3 py-2 text-sm ios-input"
      />
    </div>
  );
}
