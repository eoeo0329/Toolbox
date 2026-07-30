'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Image as ImageIcon,
  MapPin,
  Hash,
  Smile,
  X,
  ChevronDown,
  Send,
  Sparkles,
  Users,
} from 'lucide-react';
import { NavBar } from '@/components/ui/Navigation';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useApp } from '@/context/AppContext';
import { cn, getRandomImage } from '@/lib/utils';
import { mockTopics } from '@/lib/mockData';

export default function PostPage() {
  const router = useRouter();
  const { currentUser, addPost, topics } = useApp();
  const [content, setContent] = React.useState('');
  const [images, setImages] = React.useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = React.useState<string | null>(null);
  const [showTopicPicker, setShowTopicPicker] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [aiDraft, setAiDraft] = React.useState('');

  const maxLength = 500;
  const remainChars = maxLength - content.length;
  const isNearLimit = remainChars < 100;
  const isValid = content.trim().length > 0 && !publishing;

  const addImage = () => {
    if (images.length >= 9) return;
    const newImage = getRandomImage();
    setImages([...images, newImage]);
  };

  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handlePublish = async () => {
    if (!isValid) return;
    setPublishing(true);
    await new Promise((r) => setTimeout(r, 1200));
    addPost(content, images, selectedTopic || undefined);
    router.back();
  };

  const generateAIDraft = async () => {
    setAiDraft('正在生成...');
    await new Promise((r) => setTimeout(r, 1500));
    const drafts = [
      '今天体验了最新的设计模式，真的被惊艳到了！玻璃拟态效果在暗色模式下的表现格外出色，每个细节都透露出精致感。大家觉得今年最流行的设计趋势是什么？',
      '分享一个小技巧：做移动端设计时，将最小点击区域设为 44x44pt 是苹果官方的推荐，这样可以大大提升用户操作的舒适度。细节决定成败～',
      '周末读完了《设计心理学》，对「可供性」这个概念有了更深的理解。好的设计不是让用户思考，而是让产品自然地引导用户。有机会和大家详细聊聊。',
    ];
    const draft = drafts[Math.floor(Math.random() * drafts.length)];
    setAiDraft(draft);
    setContent(draft);
  };

  return (
    <div className="pb-4 min-h-screen bg-background-light dark:bg-background-dark">
      <NavBar
        title="发布动态"
        showBackButton
        onBack={() => router.back()}
        rightContent={
          <Button
            size="sm"
            variant={isValid ? 'primary' : 'secondary'}
            disabled={!isValid}
            loading={publishing}
            onClick={handlePublish}
          >
            {publishing ? '发布中...' : '发布'}
          </Button>
        }
      />

      <div className="px-4 space-y-4">
        {/* Author */}
        <div className="flex items-center gap-3">
          <Avatar src={currentUser?.avatar} size={44} fallback={currentUser?.nickname?.charAt(0)} />
          <div className="flex-1">
            <div className="text-[15px] font-semibold text-black dark:text-white">
              {currentUser?.nickname}
            </div>
            <button
              onClick={() => setShowTopicPicker((s) => !s)}
              className="flex items-center gap-1 text-[13px] text-ios-blue mt-0.5 hover:opacity-80 transition-opacity"
            >
              {selectedTopic ? (
                <>
                  <span className="px-2 py-0.5 rounded-full bg-ios-blue/10">
                    #{topics.find((t) => t.id === selectedTopic)?.name}
                  </span>
                  <X size={12} onClick={(e) => { e.stopPropagation(); setSelectedTopic(null); }} />
                </>
              ) : (
                <>
                  <Hash size={14} />
                  添加话题
                  <ChevronDown size={14} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Topic Picker Dropdown */}
        <AnimatePresence>
          {showTopicPicker && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="overflow-hidden"
            >
              <Card padding="none" className="overflow-hidden">
                {mockTopics.map((topic, i) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setSelectedTopic(topic.id);
                      setShowTopicPicker(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 hover:bg-ios-gray5/50 dark:hover:bg-white/5 transition-colors text-left',
                      i !== mockTopics.length - 1 && 'border-b border-ios-gray5/80 dark:border-white/5',
                      selectedTopic === topic.id && 'bg-ios-blue/5 dark:bg-ios-blue/10'
                    )}
                  >
                    <Hash size={18} className="text-ios-purple" />
                    <div className="flex-1">
                      <div className="text-[15px] text-black dark:text-white">{topic.name}</div>
                      <div className="text-[12px] text-ios-gray">{topic.description}</div>
                    </div>
                    {selectedTopic === topic.id && (
                      <div className="w-5 h-5 rounded-full bg-ios-blue flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text Editor */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, maxLength))}
            placeholder="分享你的想法、图片、视频..."
            className="w-full h-44 resize-none bg-transparent text-[17px] text-black dark:text-white placeholder:text-ios-gray3 outline-none leading-relaxed"
            autoFocus
          />
          
          {/* AI Draft */}
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={generateAIDraft}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-ios-purple/10 to-ios-blue/10 text-ios-purple text-[13px] font-medium hover:from-ios-purple/20 hover:to-ios-blue/20 transition-all"
          >
            <Sparkles size={14} />
            {aiDraft === '正在生成...' ? aiDraft : 'AI 帮我写'}
          </motion.button>

          <div className="flex items-center justify-between mt-2 pt-3 border-t border-ios-gray5/80 dark:border-white/5">
            {/* Media icons */}
            <div className="flex items-center gap-3">
              <ToolButton icon={ImageIcon} label="图片" onClick={addImage} color="ios-blue" />
              <ToolButton icon={Hash} label="话题" onClick={() => setShowTopicPicker(true)} color="ios-purple" />
              <ToolButton icon={MapPin} label="位置" onClick={() => {}} color="ios-green" />
              <ToolButton icon={Smile} label="表情" onClick={() => {}} color="ios-yellow" />
            </div>
            {/* Char counter */}
            <div className={cn(
              'text-[13px] font-medium tabular-nums transition-colors',
              remainChars < 0 ? 'text-ios-red' : isNearLimit ? 'text-ios-orange' : 'text-ios-gray3'
            )}>
              {remainChars}
            </div>
          </div>
        </div>

        {/* Image Grid */}
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-2"
            style={{
              gridTemplateColumns: images.length === 1 ? '1fr' : images.length === 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            }}
          >
            {images.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square rounded-xl overflow-hidden bg-ios-gray5 dark:bg-surface-secondary-dark group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`img-${i}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
            {images.length < 9 && (
              <button
                onClick={addImage}
                className="aspect-square rounded-xl border-2 border-dashed border-ios-gray4 dark:border-white/20 flex flex-col items-center justify-center gap-1 text-ios-gray hover:border-ios-blue hover:text-ios-blue hover:bg-ios-blue/5 transition-colors"
              >
                <ImageIcon size={28} strokeWidth={1.5} />
                <span className="text-[12px]">{images.length}/9</span>
              </button>
            )}
          </motion.div>
        )}

        {/* Visibility */}
        <Card padding="none" className="overflow-hidden">
          <button
            className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-ios-gray5/50 dark:hover:bg-white/5 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-ios-green/10 flex items-center justify-center">
              <Users size={18} className="text-ios-green" />
            </div>
            <div className="flex-1">
              <div className="text-[15px] text-black dark:text-white">可见范围</div>
              <div className="text-[13px] text-ios-gray">所有人可见</div>
            </div>
            <ChevronDown className="text-ios-gray3" size={18} />
          </button>
        </Card>

        {/* Publish tip */}
        <div className="px-2 py-4 text-center">
          <p className="text-[12px] text-ios-gray3 leading-relaxed">
            发布内容请遵守《社区规范》<br />
            我们会对内容进行审核，违规内容将被删除
          </p>
        </div>
      </div>
    </div>
  );
}

function ToolButton({
  icon: Icon,
  label,
  onClick,
  color,
}: {
  icon: any;
  label: string;
  onClick?: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-ios-gray5 dark:hover:bg-white/5 transition-colors active:scale-95"
      title={label}
    >
      <Icon size={22} className={`text-${color}`} />
    </button>
  );
}
