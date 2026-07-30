import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  MessageCircle, 
  User, 
  Sparkles, 
  ChevronRight,
  Star,
  Zap,
  Calendar,
  Settings
} from 'lucide-react';
import { GameCard, type GameItem } from '../components/GameCard';

const games: GameItem[] = [
  {
    id: 'detect-ai',
    name: '识破AI',
    description: '通过聊天判断对方是真人还是AI，挑战你的洞察力',
    icon: Eye,
    gradient: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
    rating: 4.8,
    difficulty: '中等',
    isAvailable: true,
    route: '/match',
  },
  {
    id: 'ai-chat',
    name: 'AI聊天',
    description: '与不同性格的AI进行深度对话，体验智能情感交互',
    icon: MessageCircle,
    gradient: 'linear-gradient(135deg, #5856D6 0%, #4845D4 100%)',
    rating: 4.5,
    difficulty: '简单',
    isAvailable: false,
  },
  {
    id: 'identity-quiz',
    name: '身份猜谜',
    description: '通过AI的回答猜出它模仿的是谁，经典的图灵测试游戏',
    icon: User,
    gradient: 'linear-gradient(135deg, #FF9500 0%, #FB5C00 100%)',
    rating: 4.6,
    difficulty: '困难',
    isAvailable: false,
  },
  {
    id: 'zodiac-love',
    name: '星座恋爱挑战',
    description: '匹配你的星座AI伴侣，测试你们的契合度',
    icon: Sparkles,
    gradient: 'linear-gradient(135deg, #FF2D92 0%, #FF375F 100%)',
    rating: 4.4,
    difficulty: '中等',
    isAvailable: false,
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  const handlePlay = (game: GameItem) => {
    if (!game.isAvailable) {
      alert('该游戏正在开发中，敬请期待！');
      return;
    }
    if (game.route) {
      navigate(game.route);
    }
  };

  return (
    <div className="min-h-screen w-full bg-ios-bg flex flex-col">
      {/* 顶部导航栏 (iOS Large Title Style) */}
      <motion.header 
        className="sticky top-0 z-50 bg-ios-bg/85 backdrop-blur-xl border-b border-black/[0.06] pt-safe"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="px-5 pb-2 flex items-center justify-between">
          <h1 className="text-[34px] font-bold tracking-tight text-ios-label">
            AI挑战中心
          </h1>
          <div className="flex items-center gap-2">
            <motion.button
              className="w-10 h-10 rounded-full bg-black/[0.05] flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/settings')}
            >
              <Settings className="w-5 h-5 text-ios-blue" />
            </motion.button>
            <motion.button
              className="w-10 h-10 rounded-full bg-black/[0.05] flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/profile')}
            >
              <User className="w-5 h-5 text-ios-blue" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* 主要内容 */}
      <main className="flex-1 px-5 pb-32 pt-4 overflow-y-auto">
        {/* 精选 Banner */}
        <motion.div
          className="relative rounded-2xl overflow-hidden mb-6 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white blur-2xl" />
            <div className="absolute right-20 bottom-0 w-24 h-24 rounded-full bg-white blur-xl" />
          </div>
          <div className="relative p-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-white fill-white" />
              <span className="text-[11px] font-semibold text-white/90 uppercase tracking-wider">
                热门推荐
              </span>
            </div>
            <h2 className="text-[22px] font-bold text-white mb-1">
              识破AI · 图灵测试
            </h2>
            <p className="text-[13px] text-white/85 mb-4 leading-relaxed">
              你能分清屏幕背后的是真人还是AI吗？加入挑战，看看你的洞察能力！
            </p>
            <motion.button
              className="inline-flex items-center gap-1 bg-white text-ios-blue font-semibold text-[14px] px-4 py-2 rounded-full"
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/match')}
            >
              立即体验
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* 游戏分类标题 */}
        <motion.div 
          className="mb-3 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-[22px] font-bold text-ios-label">游戏大厅</h2>
          <span className="text-[13px] text-ios-gray">{games.length} 款游戏</span>
        </motion.div>

        {/* 游戏列表 */}
        <div className="space-y-3">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index + 0.2 }}
            >
              <GameCard game={game} onPlay={handlePlay} />
            </motion.div>
          ))}
        </div>

        {/* 底部提示 */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-[13px] text-ios-gray mb-2">更多游戏即将上线</p>
          <div className="flex items-center justify-center gap-1 text-ios-gray">
            <Calendar className="w-4 h-4" />
            <span className="text-[12px]">敬请期待</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
