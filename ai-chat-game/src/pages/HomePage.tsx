import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, User } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="page-ios min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* 主内容 */}
      <motion.div
        className="relative z-10 text-center flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <div className="w-24 h-24 rounded-[22px] bg-gradient-to-br from-[#0A84FF] to-[#5856D6] flex items-center justify-center shadow-xl">
            <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
        </motion.div>

        {/* 标题 */}
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-4 text-black tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          你能识破AI吗？
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-[#8E8E93] mb-12 max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          与神秘陌生人聊天，判断对方是真人还是AI
        </motion.p>

        {/* 开始按钮 */}
        <motion.button
          onClick={() => navigate('/match')}
          className="ios-button-primary px-12 py-4 text-lg font-semibold mb-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.97 }}
        >
          <Play className="w-5 h-5 mr-2 inline-block" fill="currentColor" />
          开始挑战
        </motion.button>

        {/* 个人按钮 */}
        <motion.button
          onClick={() => navigate('/profile')}
          className="ios-button-secondary flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.97 }}
        >
          <User className="w-4 h-4" />
          个人记录
        </motion.button>
      </motion.div>

      {/* 底部装饰 */}
      <motion.div
        className="absolute bottom-8 text-[#8E8E93] text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        AI图灵测试社交实验
      </motion.div>
    </div>
  );
}
