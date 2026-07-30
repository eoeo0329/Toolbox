import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, User, Sparkles } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="page-dark min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

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
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl animate-glow">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        {/* 标题 */}
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-4 text-gradient"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          你能识破AI吗？
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-white/60 mb-12 max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          与神秘陌生人聊天，判断对方是真人还是AI
        </motion.p>

        {/* 开始按钮 */}
        <motion.button
          onClick={() => navigate('/match')}
          className="glass-button bg-gradient-to-r from-purple-500 to-pink-500 border-none px-12 py-4 text-lg font-semibold mb-6 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(168, 85, 247, 0.5)" }}
          whileTap={{ scale: 0.95 }}
        >
          <Play className="w-5 h-5 mr-2 inline-block" />
          开始挑战
        </motion.button>

        {/* 个人按钮 */}
        <motion.button
          onClick={() => navigate('/profile')}
          className="glass-button flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <User className="w-4 h-4" />
          个人记录
        </motion.button>
      </motion.div>

      {/* 底部装饰 */}
      <motion.div
        className="absolute bottom-8 text-white/40 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        AI图灵测试社交实验
      </motion.div>
    </div>
  );
}