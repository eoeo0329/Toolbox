import { motion } from 'framer-motion';
import { ComponentType } from 'react';
import { Play, Star } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

export interface GameItem {
  id: string;
  name: string;
  description: string;
  icon: ComponentType<LucideProps>;
  gradient: string;
  rating: number;
  difficulty: string;
  isAvailable: boolean;
  route?: string;
}

interface GameCardProps {
  game: GameItem;
  onPlay: (game: GameItem) => void;
}

export function GameCard({ game, onPlay }: GameCardProps) {
  const Icon = game.icon;

  return (
    <motion.div
      className="ios-list-item p-5 flex items-center gap-4 cursor-pointer"
      whileTap={{ scale: 0.98 }}
      onClick={() => onPlay(game)}
      layout
    >
      {/* 游戏图标 */}
      <div
        className="w-16 h-16 rounded-[18px] flex items-center justify-center shrink-0 shadow-sm"
        style={{ background: game.gradient }}
      >
        <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
      </div>

      {/* 游戏信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-[17px] font-semibold text-ios-label truncate">
            {game.name}
          </h3>
          {!game.isAvailable && (
            <span className="text-[10px] text-ios-gray bg-ios-gray/10 px-1.5 py-0.5 rounded-md font-medium">
              敬请期待
            </span>
          )}
        </div>
        <p className="text-[13px] text-ios-gray line-clamp-2 mb-1.5">
          {game.description}
        </p>

        {/* 评分与难度 */}
        <div className="flex items-center gap-3 text-[11px] text-ios-gray">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-ios-orange fill-ios-orange" />
            <span className="font-medium text-ios-secondary">
              {game.rating.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-ios-gray" />
            <span>{game.difficulty}</span>
          </div>
        </div>
      </div>

      {/* 开始按钮 */}
      <motion.button
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          game.isAvailable
            ? 'bg-ios-blue'
            : 'bg-ios-gray/20'
        }`}
        whileHover={game.isAvailable ? { scale: 1.1 } : {}}
        whileTap={{ scale: 0.9 }}
        disabled={!game.isAvailable}
      >
        <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
      </motion.button>
    </motion.div>
  );
}
