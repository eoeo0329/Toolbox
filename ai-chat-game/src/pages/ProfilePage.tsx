import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import {
  ChevronLeft,
  Target,
  TrendingUp,
  Flame,
  Star,
  Medal,
} from 'lucide-react';
import { DefaultContactAvatar } from '../components/DefaultContactAvatar';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { state } = useGame();
  const { playerStats, gameHistory } = state;

  const accuracy = playerStats.totalGames > 0
    ? Math.round((playerStats.correctGuesses / playerStats.totalGames) * 100)
    : 0;

  const achievements = getAchievements(playerStats);

  return (
    <div className="page-ios min-h-screen pb-24">
      {/* 顶部栏 */}
      <div className="ios-nav-bar sticky top-0 z-10 flex items-center gap-2 px-2 py-2">
        <motion.button
          onClick={() => navigate('/')}
          className="p-1.5 rounded-full active:bg-black/5 transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className="w-7 h-7 text-[#0A84FF]" strokeWidth={2.5} />
        </motion.button>
        <h1 className="text-[17px] font-semibold text-black ml-2">个人记录</h1>
      </div>

      {/* 等级卡片 */}
      <div className="px-4 pt-4">
        <div className="ios-list-item p-5">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A84FF] to-[#5856D6] flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{playerStats.level}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-black">Lv.{playerStats.level}</h2>
              <p className="text-sm text-[#8E8E93]">
                {playerStats.experience} / {playerStats.level * 100} XP
              </p>
            </div>
          </div>

          {/* 经验条 */}
          <div className="w-full h-1.5 bg-[#E5E5EA] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#0A84FF] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(playerStats.experience / (playerStats.level * 100)) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        <div className="ios-list-item p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-[#0A84FF]" />
            <span className="text-[13px] text-[#8E8E93]">总场次</span>
          </div>
          <p className="text-2xl font-bold text-black">{playerStats.totalGames}</p>
        </div>

        <div className="ios-list-item p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#34C759]" />
            <span className="text-[13px] text-[#8E8E93]">正确率</span>
          </div>
          <p className="text-2xl font-bold text-black">{accuracy}%</p>
        </div>

        <div className="ios-list-item p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-[#FF9500]" />
            <span className="text-[13px] text-[#8E8E93]">最高连胜</span>
          </div>
          <p className="text-2xl font-bold text-black">{playerStats.maxStreak}</p>
        </div>

        <div className="ios-list-item p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-[#FFCC00]" />
            <span className="text-[13px] text-[#8E8E93]">当前连胜</span>
          </div>
          <p className="text-2xl font-bold text-black">{playerStats.winStreak}</p>
        </div>
      </div>

      {/* 成就 */}
      <div className="px-4 mt-6">
        <h3 className="text-[13px] uppercase text-[#8E8E93] font-medium mb-2 px-1 flex items-center gap-1.5">
          <Medal className="w-3.5 h-3.5" />
          成就
        </h3>
        <div className="ios-list-item p-3 grid grid-cols-3 gap-2">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              className={`flex flex-col items-center py-2 rounded-xl ${
                achievement.unlocked ? '' : 'opacity-30'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: achievement.unlocked ? 1 : 0.3, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <div className="text-3xl mb-1">{achievement.icon}</div>
              <p className="text-[11px] font-medium text-black">{achievement.name}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 历史记录 */}
      <div className="px-4 mt-6">
        <h3 className="text-[13px] uppercase text-[#8E8E93] font-medium mb-2 px-1">
          最近记录
        </h3>

        {gameHistory.length === 0 ? (
          <div className="ios-list-item p-8 text-center text-[#8E8E93]">
            <p>暂无记录</p>
            <p className="text-sm mt-1">开始游戏以记录你的战绩</p>
          </div>
        ) : (
          <div className="ios-list-item overflow-hidden">
            {gameHistory.slice(-10).reverse().map((game, index) => (
              <motion.div
                key={game.id}
                className={`flex items-center justify-between p-3 ${
                  index !== Math.min(gameHistory.length, 10) - 1 ? 'border-b border-[#E5E5EA]' : ''
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <div className="flex items-center gap-3">
                  <DefaultContactAvatar size={40} />
                  <div>
                    <p className="font-medium text-[15px] text-black">TA</p>
                    <p className="text-[12px] text-[#8E8E93]">
                      {game.partner.isAI ? 'AI' : '真人'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[15px] text-[#0A84FF] font-medium">
                    +{game.score}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                      game.isCorrect ? 'bg-[#34C759]' : 'bg-[#FF3B30]'
                    }`}
                  >
                    {game.isCorrect ? '✓' : '✗'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div className="fixed bottom-8 left-0 right-0 px-6 max-w-md mx-auto">
        <motion.button
          onClick={() => navigate('/match')}
          className="w-full ios-button-primary py-4 text-[17px] font-semibold"
          whileTap={{ scale: 0.98 }}
        >
          开始新挑战
        </motion.button>
      </div>
    </div>
  );
}

function getAchievements(stats: any) {
  return [
    { icon: '🎮', name: '新手', unlocked: stats.totalGames >= 1 },
    { icon: '🎯', name: '神射手', unlocked: stats.correctGuesses >= 10 },
    { icon: '🔥', name: '连胜王', unlocked: stats.maxStreak >= 5 },
    { icon: '👑', name: '大师', unlocked: stats.level >= 10 },
    { icon: '💎', name: '钻石', unlocked: stats.totalGames >= 50 },
    { icon: '🌟', name: '传奇', unlocked: stats.maxStreak >= 10 },
  ];
}
