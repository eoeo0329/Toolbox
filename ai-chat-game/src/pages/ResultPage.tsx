import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Trophy, Target, Clock, MessageCircle, ArrowRight, Home, AlertCircle } from 'lucide-react';

export default function ResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useGame();
  const isTimeout = searchParams.get('timeout') === 'true';

  const { currentSession, playerStats } = state;

  useEffect(() => {
    // 清理会话
    return () => {
      dispatch({ type: 'END_SESSION' });
    };
  }, [dispatch]);

  if (!currentSession && !isTimeout) {
    navigate('/');
    return null;
  }

  if (isTimeout) {
    return (
      <div className="page-dark min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertCircle className="w-10 h-10 text-red-400" />
          </motion.div>

          <h1 className="text-3xl font-bold mb-2 text-red-400">挑战失败</h1>
          <p className="text-white/60 mb-8">对方超过1分钟未回复，挑战失败</p>

          <motion.button
            onClick={() => navigate('/')}
            className="glass-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home className="w-4 h-4 mr-2 inline-block" />
            返回首页
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const isCorrect = currentSession?.isCorrect || false;
  const score = currentSession?.score || 0;
  const partner = currentSession?.partner;

  // 分析报告
  const analysis = generateAnalysis(currentSession);

  return (
    <div className="page-dark min-h-screen flex flex-col items-center justify-center p-6 pb-32">
      {/* 结果标题 */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isCorrect
              ? 'bg-gradient-to-br from-green-400 to-emerald-500'
              : 'bg-gradient-to-br from-red-400 to-rose-500'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
        >
          {isCorrect ? (
            <Trophy className="w-12 h-12 text-white" />
          ) : (
            <Target className="w-12 h-12 text-white" />
          )}
        </motion.div>

        <h1 className={`text-4xl font-bold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
          {isCorrect ? '判断正确！' : '判断错误'}
        </h1>
        <p className="text-white/60">
          {partner?.name} 是 {partner?.isAI ? 'AI' : '真人'}
        </p>
      </motion.div>

      {/* 得分卡片 */}
      <motion.div
        className="w-full max-w-md glass-card p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">得分</h3>
          <motion.span
            className="text-3xl font-bold text-gradient"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, delay: 0.5 }}
          >
            +{score}
          </motion.span>
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="glass p-3 rounded-xl">
            <MessageCircle className="w-5 h-5 mx-auto mb-1 text-blue-400" />
            <p className="text-lg font-semibold">{currentSession?.messages.length}</p>
            <p className="text-xs text-white/40">消息</p>
          </div>
          <div className="glass p-3 rounded-xl">
            <Clock className="w-5 h-5 mx-auto mb-1 text-purple-400" />
            <p className="text-lg font-semibold">
              {Math.floor(
                ((currentSession?.endTime?.getTime() || 0) -
                  (currentSession?.startTime?.getTime() || 0)) /
                  1000
              )}s
            </p>
            <p className="text-xs text-white/40">时长</p>
          </div>
          <div className="glass p-3 rounded-xl">
            <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
            <p className="text-lg font-semibold">Lv.{playerStats.level}</p>
            <p className="text-xs text-white/40">等级</p>
          </div>
        </div>
      </motion.div>

      {/* 分析报告 */}
      <motion.div
        className="w-full max-w-md glass-card p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="font-semibold text-lg mb-4">分析报告</h3>
        <div className="space-y-3 text-sm">
          {analysis.map((item, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <span className="text-purple-400">•</span>
              <p className="text-white/70">{item}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 连胜和经验 */}
      {isCorrect && (
        <motion.div
          className="w-full max-w-md glass-card p-6 mb-6 border-green-500/30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">连胜记录</p>
              <p className="text-2xl font-bold text-green-400">
                {playerStats.winStreak} 连胜
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/60">经验值</p>
              <p className="text-2xl font-bold text-purple-400">
                +{score} XP
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 按钮组 */}
      <motion.div
        className="fixed bottom-8 left-0 right-0 px-6 flex flex-col gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <motion.button
          onClick={() => navigate('/match')}
          className="w-full glass-button bg-gradient-to-r from-purple-500 to-pink-500 border-none py-4 text-lg font-semibold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          继续挑战
          <ArrowRight className="w-5 h-5 ml-2 inline-block" />
        </motion.button>

        <motion.button
          onClick={() => navigate('/profile')}
          className="w-full glass-button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Home className="w-4 h-4 mr-2 inline-block" />
          查看个人记录
        </motion.button>
      </motion.div>
    </div>
  );
}

function generateAnalysis(session: any): string[] {
  if (!session) return [];

  const analysis: string[] = [];
  const messages = session.messages || [];
  const partner = session.partner;

  // 分析消息数量
  if (messages.length < 3) {
    analysis.push('聊天时间较短，建议多聊几句以获得更准确的判断');
  } else if (messages.length > 10) {
    analysis.push('充分的聊天轮次，有助于观察对方的语言特征');
  }

  // 分析AI特征
  if (partner?.isAI) {
    analysis.push(`AI展现了${partner.personality || '独特'}的回复风格`);

    if (partner.personality === 'cold') {
      analysis.push('回复简短冷淡，这是AI模拟冷漠型人格的典型特征');
    } else if (partner.personality === 'energetic') {
      analysis.push('回复热情洋溢，过度使用感叹号可能是AI模拟活泼型人格');
    } else if (partner.personality === 'humorous') {
      analysis.push('幽默的回复中带有刻意感，可能暗示了AI身份');
    } else if (partner.personality === 'rational') {
      analysis.push('过于理性和逻辑化的回复，这是AI常见的语言模式');
    } else if (partner.personality === 'emotional') {
      analysis.push('情感表达略显刻意，可能是AI在模拟情绪化型人格');
    }
  } else {
    analysis.push('真人回复具有自然的语言节奏');
    analysis.push('对话中展现了真实的情感波动');
  }

  // 分析回复时间
  const responseTimes = messages
    .filter((m: any) => m.sender === 'opponent')
    .map((m: any) => m.timestamp);

  if (responseTimes.length > 1) {
    analysis.push('回复时间分布较为自然');
  }

  return analysis;
}