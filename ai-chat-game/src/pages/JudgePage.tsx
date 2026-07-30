import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { User, Bot, Sparkles } from 'lucide-react';
import { DefaultContactAvatar } from '../components/DefaultContactAvatar';

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
    <div className="page-ios min-h-screen flex flex-col items-center justify-center p-6">
      {/* 标题 */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2 text-black tracking-tight">做出判断</h1>
        <p className="text-[#8E8E93]">你认为对方是真人还是AI？</p>
      </motion.div>

      {/* 聊天对象信息 */}
      <motion.div
        className="flex items-center gap-4 mb-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <DefaultContactAvatar size={64} />
        <div>
          <h2 className="text-xl font-semibold text-black">TA</h2>
          <p className="text-sm text-[#8E8E93]">
            聊天消息：{currentSession.messages.length} 条
          </p>
        </div>
      </motion.div>

      {/* 选择卡片 */}
      <div className="w-full max-w-md space-y-3 mb-8">
        {/* 真人选项 */}
        <motion.button
          onClick={() => setSelected('human')}
          className={`w-full ios-list-item p-5 flex items-center gap-4 transition-all ${
            selected === 'human' ? 'ring-2 ring-[#0A84FF] bg-[#0A84FF]/5' : ''
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-12 h-12 rounded-full bg-[#34C759] flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-semibold text-lg text-black">真人</h3>
            <p className="text-sm text-[#8E8E93]">对方是真实的人类用户</p>
          </div>
        </motion.button>

        {/* AI选项 */}
        <motion.button
          onClick={() => setSelected('ai')}
          className={`w-full ios-list-item p-5 flex items-center gap-4 transition-all ${
            selected === 'ai' ? 'ring-2 ring-[#0A84FF] bg-[#0A84FF]/5' : ''
          }`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-12 h-12 rounded-full bg-[#0A84FF] flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-semibold text-lg text-black">AI</h3>
            <p className="text-sm text-[#8E8E93]">对方是人工智能程序</p>
          </div>
        </motion.button>
      </div>

      {/* 确认按钮 */}
      <motion.button
        onClick={handleConfirm}
        disabled={!selected}
        className="ios-button-primary w-full max-w-md py-4 text-lg font-semibold disabled:opacity-40"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileTap={{ scale: selected ? 0.98 : 1 }}
      >
        <Sparkles className="w-5 h-5 mr-2 inline-block" />
        确认判断
      </motion.button>

      {/* 提示 */}
      {!selected && (
        <motion.p
          className="text-[#8E8E93] text-sm mt-4"
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
