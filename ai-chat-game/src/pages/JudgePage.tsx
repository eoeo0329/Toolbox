import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { User, Bot, Sparkles } from 'lucide-react';

export default function JudgePage() {
  const navigate = useNavigate();
  const { state, makeGuess } = useGame();
  const [selected, setSelected] = useState<'human' | 'ai' | null>(null);

  const { currentSession } = state;

  if (!currentSession) {
    navigate('/');
    return null;
  }

  const handleConfirm = () => {
    if (!selected) return;
    makeGuess(selected);
    navigate('/result');
  };

  return (
    <div className="page-dark min-h-screen flex flex-col items-center justify-center p-6">
      {/* 标题 */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2 text-gradient">做出判断</h1>
        <p className="text-white/60">你认为对方是真人还是AI？</p>
      </motion.div>

      {/* 聊天对象信息 */}
      <motion.div
        className="flex items-center gap-4 mb-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <img
          src={currentSession.partner.avatar}
          alt={currentSession.partner.name}
          className="w-16 h-16 rounded-full shadow-lg"
        />
        <div>
          <h2 className="text-xl font-semibold">{currentSession.partner.name}</h2>
          <p className="text-sm text-white/60">
            聊天消息：{currentSession.messages.length} 条
          </p>
        </div>
      </motion.div>

      {/* 选择卡片 */}
      <div className="w-full max-w-md space-y-4 mb-8">
        {/* 真人选项 */}
        <motion.button
          onClick={() => setSelected('human')}
          className={`w-full glass-card p-6 flex items-center gap-4 transition-all ${
            selected === 'human'
              ? 'border-purple-500 bg-purple-500/20'
              : 'hover:bg-white/5'
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-lg">真人</h3>
            <p className="text-sm text-white/60">对方是真实的人类用户</p>
          </div>
        </motion.button>

        {/* AI选项 */}
        <motion.button
          onClick={() => setSelected('ai')}
          className={`w-full glass-card p-6 flex items-center gap-4 transition-all ${
            selected === 'ai'
              ? 'border-purple-500 bg-purple-500/20'
              : 'hover:bg-white/5'
          }`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-lg">AI</h3>
            <p className="text-sm text-white/60">对方是人工智能程序</p>
          </div>
        </motion.button>
      </div>

      {/* 确认按钮 */}
      <motion.button
        onClick={handleConfirm}
        disabled={!selected}
        className="glass-button bg-gradient-to-r from-purple-500 to-pink-500 border-none px-12 py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: selected ? 1.05 : 1 }}
        whileTap={{ scale: selected ? 0.95 : 1 }}
      >
        <Sparkles className="w-5 h-5 mr-2 inline-block" />
        确认判断
      </motion.button>

      {/* 提示 */}
      {!selected && (
        <motion.p
          className="text-white/40 text-sm mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          请选择一个答案
        </motion.p>
      )}
    </div>
  );
}