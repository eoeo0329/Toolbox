import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import {
  Trophy,
  Target,
  Clock,
  Flame,
  ChevronLeft,
  Medal,
  TrendingUp,
  Star
} from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { state } = useGame();
  const { playerStats, gameHistory } = state;

  const accuracy = playerStats.totalGames > 0
    ? Math.round((playerStats.correctGuesses / playerStats.totalGames) * 100)
    : 0;

  const achievements = getAchievements(playerStats);

  return (
    <div className="page-dark min-h-screen pb-24">
      {/* 顶部栏 */}
      <div className="glass-card rounded-none border-t-0 border-x-0 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <motion.button
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <h1 className="text-xl font-semibold">个人记录</h1>
      </div>

      {/* 等级卡片 */}
      <motion.div
        className="p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <span className="text-2xl font-bold">{playerStats.level}</span>
              </motion.div>
              <div>
                <h2 className="text-xl font-bold">Lv.{playerStats.level}</h2>
                <p className="text-sm text-white/60">
                  {playerStats.experience} / {playerStats.level * 100} XP
                </p>
              </div>
            </div>
          </div>

          {/* 经验条 */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${(playerStats.experience / (playerStats.level * 100)) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* 统计数据 */}
      <motion.div
        className="px-6 grid grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* 总场次 */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-white/60">总场次</span>
          </div>
          <p className="text-2xl font-bold">{playerStats.totalGames}</p>
        </div>

        {/* 正确率 */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-white/60">正确率</span>
          </div>
          <p className="text-2xl font-bold">{accuracy}%</p>
        </div>

        {/* 连胜记录 */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-white/60">连胜记录</span>
          </div>
          <p className="text-2xl font-bold">{playerStats.maxStreak}</p>
        </div>

        {/* 当前连胜 */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white/60">当前连胜</span>
          </div>
          <p className="text-2xl font-bold">{playerStats.winStreak}</p>
        </div>
      </motion.div>

      {/* 成就 */}
      <motion.div
        className="px-6 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Medal className="w-5 h-5 text-yellow-400" />
          成就
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              className={`glass-card p-4 text-center ${
                achievement.unlocked ? '' : 'opacity-40'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: achievement.unlocked ? 1 : 0.4, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <p className="text-xs font-medium">{achievement.name}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 历史记录 */}
      <motion.div
        className="px-6 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          最近记录
        </h3>

        {gameHistory.length === 0 ? (
          <div className="glass-card p-8 text-center text-white/40">
            <p>暂无记录</p>
            <p className="text-sm mt-1">开始游戏以记录你的战绩</p>
          </div>
        ) : (
          <div className="space-y-3">
            {gameHistory.slice(-10).reverse().map((game, index) => (
              <motion.div
                key={game.id}
                className="glass-card p-4 flex items-center justify-between"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={game.partner.avatar}
                    alt={game.partner.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{game.partner.name}</p>
                    <p className="text-xs text-white/40">
                      {game.partner.isAI ? 'AI' : '真人'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-white/60">
                    +{game.score}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      game.isCorrect
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {game.isCorrect ? '✓' : '✗'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* 底部按钮 */}
      <motion.div
        className="fixed bottom-8 left-0 right-0 px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={() => navigate('/match')}
          className="w-full glass-button bg-gradient-to-r from-purple-500 to-pink-500 border-none py-4 text-lg font-semibold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          开始新挑战
        </motion.button>
      </motion.div>
    </div>
  );
}

function getAchievements(stats: any) {
  return [
    {
      icon: '🎮',
      name: '新手',
      unlocked: stats.totalGames >= 1,
    },
    {
      icon: '🎯',
      name: '神射手',
      unlocked: stats.correctGuesses >= 10,
    },
    {
      icon: '🔥',
      name: '连胜王',
      unlocked: stats.maxStreak >= 5,
    },
    {
      icon: '👑',
      name: '大师',
      unlocked: stats.level >= 10,
    },
    {
      icon: '💎',
      name: '钻石',
      unlocked: stats.totalGames >= 50,
    },
    {
      icon: '🌟',
      name: '传奇',
      unlocked: stats.maxStreak >= 10,
    },
  ];
}