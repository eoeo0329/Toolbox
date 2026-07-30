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
  Gamepad2,
  Crosshair,
  Crown,
  Gem,
  Sparkles,
  Check,
  X,
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
          <ChevronLeft className="w-7 h-7 text-ios-blue" strokeWidth={2.5} />
        </motion.button>
        <h1 className="text-[17px] font-semibold text-ios-label ml-2">个人记录</h1>
      </div>

      {/* 等级卡片 */}
      <div className="px-4 pt-4">
        <div className="ios-list-item p-5">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 rounded-2xl bg-ios-blue flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{playerStats.level}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-ios-label">Lv.{playerStats.level}</h2>
              <p className="text-sm text-ios-gray">
                {playerStats.experience} / {playerStats.level * 100} XP
              </p>
            </div>
          </div>

          {/* 经验条 */}
          <div className="w-full h-1.5 bg-ios-gray/15 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-ios-blue rounded-full"
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
            <Target className="w-4 h-4 text-ios-blue" />
            <span className="text-[13px] text-ios-gray">总场次</span>
          </div>
          <p className="text-2xl font-bold text-ios-label">{playerStats.totalGames}</p>
        </div>

        <div className="ios-list-item p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-ios-green" />
            <span className="text-[13px] text-ios-gray">正确率</span>
          </div>
          <p className="text-2xl font-bold text-ios-label">{accuracy}%</p>
        </div>

        <div className="ios-list-item p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-ios-orange" />
            <span className="text-[13px] text-ios-gray">最高连胜</span>
          </div>
          <p className="text-2xl font-bold text-ios-label">{playerStats.maxStreak}</p>
        </div>

        <div className="ios-list-item p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-ios-orange" />
            <span className="text-[13px] text-ios-gray">当前连胜</span>
          </div>
          <p className="text-2xl font-bold text-ios-label">{playerStats.winStreak}</p>
        </div>
      </div>

      {/* 成就 */}
      <div className="px-4 mt-6">
        <h3 className="text-[13px] uppercase text-ios-gray font-medium mb-2 px-1 flex items-center gap-1.5">
          <Medal className="w-3.5 h-3.5" />
          成就
        </h3>
        <div className="ios-list-item p-3 grid grid-cols-3 gap-2">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center py-2 rounded-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: achievement.unlocked ? 1 : 0.35, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 transition-colors ${
                  achievement.unlocked
                    ? achievement.bgColor
                    : 'bg-ios-gray/10'
                }`}
              >
                <achievement.icon
                  className={`w-5 h-5 ${
                    achievement.unlocked ? achievement.color : 'text-ios-gray'
                  }`}
                  strokeWidth={2}
                />
              </div>
              <p className={`text-[11px] font-medium text-center ${
                achievement.unlocked ? 'text-ios-label' : 'text-ios-gray'
              }`}>
                {achievement.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 历史记录 */}
      <div className="px-4 mt-6">
        <h3 className="text-[13px] uppercase text-ios-gray font-medium mb-2 px-1">
          最近记录
        </h3>

        {gameHistory.length === 0 ? (
          <div className="ios-list-item p-8 text-center text-ios-gray">
            <p>暂无记录</p>
            <p className="text-sm mt-1">开始游戏以记录你的战绩</p>
          </div>
        ) : (
          <div className="ios-list-item overflow-hidden">
            {gameHistory.slice(-10).reverse().map((game, index) => (
              <motion.div
                key={game.id}
                className={`flex items-center justify-between p-3 ${
                  index !== Math.min(gameHistory.length, 10) - 1 ? 'border-b border-ios-separator' : ''
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <div className="flex items-center gap-3">
                  <DefaultContactAvatar size={40} />
                  <div>
                    <p className="font-medium text-[15px] text-ios-label">TA</p>
                    <p className="text-[12px] text-ios-gray">
                      {game.partner.isAI ? 'AI' : '真人'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[15px] text-ios-blue font-medium">
                    +{game.score}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
                      game.isCorrect ? 'bg-ios-green' : 'bg-ios-red'
                    }`}
                  >
                    {game.isCorrect ? (
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    ) : (
                      <X className="w-3.5 h-3.5" strokeWidth={3} />
                    )}
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
    { icon: Gamepad2, name: '新手', color: 'text-ios-blue', bgColor: 'bg-ios-blue/15', unlocked: stats.totalGames >= 1 },
    { icon: Crosshair, name: '神射手', color: 'text-ios-red', bgColor: 'bg-ios-red/15', unlocked: stats.correctGuesses >= 10 },
    { icon: Flame, name: '连胜王', color: 'text-ios-orange', bgColor: 'bg-ios-orange/15', unlocked: stats.maxStreak >= 5 },
    { icon: Crown, name: '大师', color: 'text-ios-orange', bgColor: 'bg-ios-orange/15', unlocked: stats.level >= 10 },
    { icon: Gem, name: '钻石', color: 'text-ios-blue', bgColor: 'bg-ios-blue/15', unlocked: stats.totalGames >= 50 },
    { icon: Sparkles, name: '传奇', color: 'text-ios-orange', bgColor: 'bg-ios-orange/15', unlocked: stats.maxStreak >= 10 },
  ];
}
