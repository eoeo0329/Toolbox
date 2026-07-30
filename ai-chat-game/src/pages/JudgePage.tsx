import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { User, Bot, Eye, Sparkles } from 'lucide-react';
import { DefaultContactAvatar } from '../components/DefaultContactAvatar';

export default function JudgePage() {
  const navigate = useNavigate();
  const { state, makeGuess } = useGame();
  const [selected, setSelected] = useState<'human' | 'ai' | null>(null);
  const [revealing, setRevealing] = useState(false);

  const { currentSession } = state;

  if (!currentSession) {
    navigate('/');
    return null;
  }

  const messageCount = currentSession.messages.length;
  const duration = currentSession.endTime
    ? Math.floor((currentSession.endTime.getTime() - currentSession.startTime.getTime()) / 1000)
    : 0;

  const handleConfirm = () => {
    if (!selected) return;
    setRevealing(true);
    makeGuess(selected);
    setTimeout(() => {
      navigate('/result');
    }, 600);
  };

  return (
    <div className="page-ios min-h-screen flex flex-col pb-8">
      {/* 状态栏占位 */}
      <div className="h-11" />

      {/* 顶部关闭按钮 */}
      <div className="flex justify-end px-4 pb-2">
        <button
          onClick={() => navigate('/')}
          className="text-ios-blue text-[17px] active:opacity-60"
        >
          取消
        </button>
      </div>

      {/* 身份揭晓标题 */}
      <motion.div
        className="text-center px-6 pt-2 pb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-ios-blue/10 mb-4"
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Eye className="w-7 h-7 text-ios-blue" />
        </motion.div>

        <h1 className="text-[32px] font-bold tracking-tight text-ios-label mb-2">
          揭晓身份
        </h1>
        <p className="text-[15px] text-ios-gray">
          仔细回顾对话后，猜猜 TA 是谁？
        </p>
      </motion.div>

      {/* 聊天对象卡片 */}
      <motion.div
        className="mx-4 mb-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="ios-list-item p-5 flex items-center gap-4">
          <DefaultContactAvatar size={56} />
          <div className="flex-1">
            <h2 className="text-[17px] font-semibold text-ios-label">神秘对话者</h2>
            <p className="text-[13px] text-ios-gray mt-0.5">
              {messageCount} 条消息 · {duration} 秒对话
            </p>
          </div>
        </div>
      </motion.div>

      {/* 统计信息 */}
      <motion.div
        className="mx-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="ios-list-item px-5 py-3 flex items-center justify-between">
          <span className="text-[13px] text-ios-gray uppercase tracking-wide">线索</span>
          <div className="flex items-center gap-4 text-[13px]">
            <span className="text-ios-secondary">
              <span className="text-ios-label font-semibold">{messageCount}</span> 条
            </span>
            <span className="text-ios-secondary">
              <span className="text-ios-label font-semibold">{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* 选项标题 */}
      <div className="px-6 mb-3">
        <h3 className="text-[13px] uppercase text-ios-gray font-medium tracking-wide">
          我的判断
        </h3>
      </div>

      {/* 选择卡片 */}
      <div className="mx-4 space-y-3 mb-8">
        {/* 真人选项 */}
        <motion.button
          onClick={() => setSelected('human')}
          disabled={revealing}
          className={`w-full ios-list-item p-5 flex items-center gap-4 transition-all ${
            selected === 'human'
              ? '!bg-ios-green/8 ring-2 ring-ios-green'
              : 'active:bg-black/[0.02]'
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              selected === 'human' ? 'bg-ios-green' : 'bg-ios-gray/15'
            }`}
          >
            <User className={`w-6 h-6 ${selected === 'human' ? 'text-white' : 'text-ios-gray'}`} />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-semibold text-[17px] text-ios-label">真人</h3>
            <p className="text-[13px] text-ios-gray mt-0.5">对方是真实的人类用户</p>
          </div>
          {selected === 'human' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 rounded-full bg-ios-green flex items-center justify-center"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
        </motion.button>

        {/* AI选项 */}
        <motion.button
          onClick={() => setSelected('ai')}
          disabled={revealing}
          className={`w-full ios-list-item p-5 flex items-center gap-4 transition-all ${
            selected === 'ai'
              ? '!bg-ios-blue/8 ring-2 ring-ios-blue'
              : 'active:bg-black/[0.02]'
          }`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              selected === 'ai' ? 'bg-ios-blue' : 'bg-ios-gray/15'
            }`}
          >
            <Bot className={`w-6 h-6 ${selected === 'ai' ? 'text-white' : 'text-ios-gray'}`} />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-semibold text-[17px] text-ios-label">AI</h3>
            <p className="text-[13px] text-ios-gray mt-0.5">对方是人工智能程序</p>
          </div>
          {selected === 'ai' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 rounded-full bg-ios-blue flex items-center justify-center"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* 确认按钮 */}
      <motion.div
        className="px-4 mt-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          onClick={handleConfirm}
          disabled={!selected || revealing}
          className="w-full ios-button-primary py-4 text-[17px] flex items-center justify-center gap-2"
          whileTap={{ scale: selected ? 0.98 : 1 }}
        >
          <Sparkles className="w-5 h-5" />
          {revealing ? '揭晓中...' : '确认我的判断'}
        </motion.button>

        {!selected && (
          <motion.p
            className="text-ios-gray text-[12px] text-center mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            选择一个答案以继续
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
