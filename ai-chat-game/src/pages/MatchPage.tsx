import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Loader2 } from 'lucide-react';

export default function MatchPage() {
  const navigate = useNavigate();
  const { state, startMatching } = useGame();

  useEffect(() => {
    startMatching();
  }, []);

  useEffect(() => {
    if (!state.isMatching && state.currentSession) {
      navigate('/chat');
    }
  }, [state.isMatching, state.currentSession, navigate]);

  return (
    <div className="page-ios min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* 背景动画圆圈 */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 rounded-full border border-ios-blue/20"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: [0.5, 2, 0.5],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.6,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* 加载图标 */}
      <motion.div
        className="relative z-10 mb-8"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className="w-16 h-16 text-ios-blue" />
      </motion.div>

      {/* 匹配文字 */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-semibold mb-2 text-ios-label">正在匹配聊天对象</h2>
        <p className="text-ios-gray">请稍候...</p>
      </motion.div>

      {/* 动态提示 */}
      <motion.div
        className="absolute bottom-12 text-ios-gray text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {['分析用户数据', '建立连接', '准备聊天室'].map((text, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 + i * 0.5 }}
          >
            {text}...
          </motion.p>
        ))}
      </motion.div>
    </div>
  );
}
