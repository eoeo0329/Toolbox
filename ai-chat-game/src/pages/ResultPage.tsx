import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import {
  Trophy,
  Target,
  Clock,
  MessageCircle,
  ArrowRight,
  Home,
  AlertCircle,
  X,
  Check,
  User,
  Bot,
  Eye,
} from 'lucide-react';

export default function ResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useGame();
  const isTimeout = searchParams.get('timeout') === 'true';

  const { currentSession, playerStats } = state;

  if (!currentSession && !isTimeout) {
    navigate('/');
    return null;
  }

  if (isTimeout) {
    return (
      <div className="page-ios min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(255, 59, 48, 0.12)' }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertCircle className="w-10 h-10 text-ios-red" />
          </motion.div>

          <h1 className="text-[32px] font-bold mb-2 text-ios-red tracking-tight">挑战失败</h1>
          <p className="text-ios-gray mb-8">对方超过 1 分钟未回复，挑战失败</p>

          <motion.button
            onClick={() => navigate('/')}
            className="ios-button-primary px-12 py-3.5 text-[17px]"
            whileTap={{ scale: 0.97 }}
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
  const isAI = partner?.isAI || false;
  const opponentGuess = currentSession?.opponentGuess;
  const opponentCorrect = currentSession?.opponentCorrect || false;

  const analysis = generateAnalysis(currentSession);

  return (
    <div className="page-ios min-h-screen flex flex-col pb-32">
      <div className="h-11" />

      {/* 顶部关闭按钮 */}
      <div className="flex justify-end px-4 pb-2">
        <button
          onClick={() => navigate('/')}
          className="w-8 h-8 rounded-full bg-ios-gray/15 flex items-center justify-center active:opacity-60"
        >
          <X className="w-5 h-5 text-ios-label" />
        </button>
      </div>

      {/* 结果标题 */}
      <motion.div
        className="text-center px-6 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${
            isCorrect ? '' : ''
          }`}
          style={{
            background: isCorrect ? '#34C759' : '#FF3B30',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, delay: 0.2 }}
        >
          {isCorrect ? (
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          ) : (
            <X className="w-10 h-10 text-white" strokeWidth={3} />
          )}
        </motion.div>

        <h1 className="text-[32px] font-bold mb-2 tracking-tight" style={{ color: isCorrect ? '#34C759' : '#FF3B30' }}>
          {isCorrect ? '判断正确' : '判断错误'}
        </h1>
        <p className="text-ios-gray text-[15px]">
          TA 是 {isAI ? 'AI' : '真人'}
        </p>
      </motion.div>

      {/* 身份揭晓卡片 */}
      <motion.div
        className="mx-4 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="ios-list-item p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] uppercase text-ios-gray font-medium tracking-wide">得分</h3>
            <motion.span
              className="text-[28px] font-bold text-ios-blue"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, delay: 0.5 }}
            >
              +{score}
            </motion.span>
          </div>

          <div className="h-px bg-ios-separator my-3" />

          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <MessageCircle className="w-5 h-5 mx-auto mb-1 text-ios-blue" />
              <p className="text-[20px] font-semibold text-ios-label">{currentSession?.messages.length}</p>
              <p className="text-[11px] text-ios-gray">消息</p>
            </div>
            <div>
              <Clock className="w-5 h-5 mx-auto mb-1 text-ios-orange" />
              <p className="text-[20px] font-semibold text-ios-label">
                {Math.floor(
                  ((currentSession?.endTime?.getTime() || 0) -
                    (currentSession?.startTime?.getTime() || 0)) /
                    1000
                )}s
              </p>
              <p className="text-[11px] text-ios-gray">时长</p>
            </div>
            <div>
              <Trophy className="w-5 h-5 mx-auto mb-1 text-ios-orange" />
              <p className="text-[20px] font-semibold text-ios-label">Lv.{playerStats.level}</p>
              <p className="text-[11px] text-ios-gray">等级</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 分析报告 */}
      <motion.div
        className="mx-4 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-[13px] uppercase text-ios-gray font-medium tracking-wide px-1 mb-2">
          对话分析
        </h3>
        <div className="ios-list-item p-5">
          <div className="space-y-3 text-[14px] leading-relaxed">
            {analysis.map((item, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-2.5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.08 }}
              >
                <span className="text-ios-blue mt-0.5">•</span>
                <p className="text-ios-secondary flex-1">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 游戏胜负 - 双向揭晓 */}
      <motion.div
        className="mx-4 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <h3 className="text-[13px] uppercase text-ios-gray font-medium tracking-wide px-1 mb-2">
          游戏胜负
        </h3>
        <div className="ios-list-item p-5">
          {/* 你的判断 */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCorrect ? 'bg-ios-green/15' : 'bg-ios-red/15'}`}>
              {currentSession?.playerGuess === 'human' ? (
                <User className={`w-5 h-5 ${isCorrect ? 'text-ios-green' : 'text-ios-red'}`} />
              ) : (
                <Bot className={`w-5 h-5 ${isCorrect ? 'text-ios-green' : 'text-ios-red'}`} />
              )}
            </div>
            <div className="flex-1">
              <p className="text-[13px] text-ios-gray">你的判断</p>
              <p className="text-[15px] font-semibold text-ios-label">
                对方是 {currentSession?.playerGuess === 'human' ? '真人' : 'AI'}
                <span className={`ml-2 text-[13px] font-medium ${isCorrect ? 'text-ios-green' : 'text-ios-red'}`}>
                  {isCorrect ? '猜对了' : '猜错了'}
                </span>
              </p>
            </div>
          </div>

          <div className="h-px bg-ios-separator my-3" />

          {/* 对方的判断 */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${opponentCorrect ? 'bg-ios-green/15' : 'bg-ios-red/15'}`}>
              <Eye className={`w-5 h-5 ${opponentCorrect ? 'text-ios-green' : 'text-ios-red'}`} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] text-ios-gray">对方的判断</p>
              <p className="text-[15px] font-semibold text-ios-label">
                你是 {opponentGuess === 'human' ? '真人' : 'AI'}
                <span className={`ml-2 text-[13px] font-medium ${opponentCorrect ? 'text-ios-green' : 'text-ios-red'}`}>
                  {opponentCorrect ? '对方猜对了' : '对方猜错了'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 连胜和经验 */}
      {isCorrect && (
        <motion.div
          className="mx-4 mb-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55 }}
        >
          <div className="ios-list-item p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-ios-green/15 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-ios-green" />
              </div>
              <div>
                <p className="text-[11px] text-ios-gray uppercase">连胜</p>
                <p className="text-[20px] font-bold text-ios-green leading-tight">
                  {playerStats.winStreak}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[11px] text-ios-gray uppercase">经验</p>
                <p className="text-[20px] font-bold text-ios-blue leading-tight">
                  +{score}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-ios-blue/15 flex items-center justify-center">
                <Target className="w-5 h-5 text-ios-blue" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 按钮组 */}
      <motion.div
        className="fixed bottom-8 left-0 right-0 px-6 flex flex-col gap-3 max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
      >
        <motion.button
          onClick={() => {
            dispatch({ type: 'END_SESSION' });
            navigate('/match');
          }}
          className="w-full ios-button-primary py-4 text-[17px] font-semibold flex items-center justify-center gap-2"
          whileTap={{ scale: 0.98 }}
        >
          再来一局
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        <motion.button
          onClick={() => {
            dispatch({ type: 'END_SESSION' });
            navigate('/');
          }}
          className="w-full ios-button-secondary py-3.5 text-[15px] flex items-center justify-center gap-2"
          whileTap={{ scale: 0.98 }}
        >
          <Home className="w-4 h-4" />
          返回首页
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

  if (messages.length < 3) {
    analysis.push('对话轮次偏少，AI 在短对话中较难被识别');
  } else if (messages.length > 10) {
    analysis.push('充分的对话轮次，更容易观察语言特征');
  }

  if (partner?.isAI) {
    analysis.push(`AI 展现了「${partner.personality || '独特'}」的回复风格`);

    if (partner.personality === 'cold') {
      analysis.push('回复简短冷淡，缺乏自然的口语细节');
    } else if (partner.personality === 'energetic') {
      analysis.push('过度使用感叹号，情绪表达较为刻意');
    } else if (partner.personality === 'humorous') {
      analysis.push('幽默的回复中带有刻意编排的痕迹');
    } else if (partner.personality === 'rational') {
      analysis.push('回复过于结构化，缺乏日常对话的跳跃性');
    } else if (partner.personality === 'emotional') {
      analysis.push('情感表达偏模式化，可能为预设模板');
    }
  } else {
    analysis.push('真人回复具有自然的节奏与情绪波动');
    analysis.push('对话中出现了即兴的口语表达');
  }

  return analysis;
}
