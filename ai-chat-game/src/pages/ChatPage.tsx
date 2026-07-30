import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import {
  ChevronLeft,
  Plus,
  Mic,
  ArrowUp,
  Lock,
} from 'lucide-react';
import type { Message } from '../types';
import { DefaultContactAvatar } from '../components/DefaultContactAvatar';

export default function ChatPage() {
  const navigate = useNavigate();
  const { state, sendMessage } = useGame();
  const [inputValue, setInputValue] = useState('');
  const [countdown, setCountdown] = useState(60);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { currentSession, isTyping } = state;

  // 倒计时逻辑
  useEffect(() => {
    if (!currentSession) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/result?timeout=true');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentSession, navigate]);

  // 收到消息重置倒计时
  useEffect(() => {
    if (currentSession && currentSession.messages.length > 0) {
      const lastMessage = currentSession.messages[currentSession.messages.length - 1];
      if (lastMessage.sender === 'opponent') {
        setCountdown(60);
      }
    }
  }, [currentSession?.messages]);

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, isTyping]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !currentSession) return;
    sendMessage(inputValue.trim());
    setInputValue('');
    setCountdown(60);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleEndChat = () => {
    navigate('/judge');
  };

  if (!currentSession) return <div className="h-screen bg-[#F2F2F7] flex items-center justify-center">加载中...</div>;

  const partner = currentSession.partner;
  const now = new Date();
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="h-screen flex flex-col bg-[#F2F2F7] text-black">
      {/* ===== 顶部导航栏 ===== */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200 shrink-0 z-10">
        {/* 居中：iOS 联系人默认头像 + 名字（固定显示 "TA"） */}
        <div className="flex justify-center pt-2 pb-1.5">
          <div className="flex flex-col items-center">
            <DefaultContactAvatar size={44} />
            <span className="text-[13px] font-semibold text-black mt-1">TA</span>
          </div>
        </div>
      </div>

      {/* ===== 聊天区域 ===== */}
      <div className="flex-1 overflow-y-auto px-3 pt-2 pb-1">
        {/* iMessage 加密提示 */}
        <div className="flex flex-col items-center gap-0.5 mb-3">
          <span className="text-[11px] text-gray-400 font-medium">iMessage 信息</span>
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-gray-400" />
            <span className="text-[11px] text-gray-400">已加密</span>
          </div>
        </div>

        {/* 时间分隔线 */}
        <div className="flex justify-center mb-3">
          <span className="text-[11px] text-gray-400">今天 {timeStr}</span>
        </div>

        {/* 消息列表 */}
        <AnimatePresence initial={false}>
          {currentSession.messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLast={index === currentSession.messages.length - 1}
            />
          ))}
        </AnimatePresence>

        {/* 正在输入指示器 */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-1"
          >
            <div className="bg-[#E5E5EA] rounded-[18px] rounded-bl-[4px] px-4 py-2.5 max-w-[75%] min-w-[50px]">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ===== 底部输入区域 ===== */}
      <div className="bg-[#F2F2F7] border-t border-gray-200 shrink-0">
        {/* 倒计时提示（剩余10秒时显示） */}
        {countdown <= 10 && countdown > 0 && (
          <motion.div
            className="flex justify-center py-1"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <span className="text-xs text-red-500 font-medium">
              {countdown}秒后超时
            </span>
          </motion.div>
        )}

        <div className="flex items-end gap-2 px-3 py-2">
          {/* + 按钮 */}
          <motion.button
            className="w-8 h-8 rounded-full bg-[#007AFF] flex items-center justify-center mb-1 shrink-0"
            whileTap={{ scale: 0.9 }}
          >
            <Plus className="w-5 h-5 text-white" />
          </motion.button>

          {/* 输入框 */}
          <div className="flex-1 bg-white rounded-full flex items-center px-4 py-2 min-h-[36px] max-h-[120px]">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={inputValue ? '' : 'iMessage 信息'}
              className="w-full text-[16px] outline-none bg-transparent placeholder:text-[#C7C7CC]"
              autoFocus
            />
          </div>

          {/* 发送/麦克风按钮 */}
          {inputValue.trim() ? (
            <motion.button
              onClick={handleSendMessage}
              className="w-8 h-8 rounded-full bg-[#007AFF] flex items-center justify-center mb-1 shrink-0"
              whileTap={{ scale: 0.9 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              <ArrowUp className="w-5 h-5 text-white" />
            </motion.button>
          ) : (
            <motion.button
              className="w-8 h-8 flex items-center justify-center mb-1 shrink-0"
              whileTap={{ scale: 0.9 }}
            >
              <Mic className="w-6 h-6 text-[#007AFF]" />
            </motion.button>
          )}
        </div>

        {/* 结束聊天 */}
        <button
          onClick={handleEndChat}
          className="w-full text-center text-[11px] text-gray-400 py-1.5 hover:text-gray-600 transition-colors"
        >
          结束聊天，做出判断
        </button>
      </div>
    </div>
  );
}

// ===== 消息气泡组件 =====
function MessageBubble({ message, isLast }: { message: Message; isLast: boolean }) {
  const isPlayer = message.sender === 'player';
  const timeStr = message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`flex ${isPlayer ? 'justify-end' : 'justify-start'} mb-1`}
    >
      <div className="flex flex-col max-w-[75%]">
        {/* 气泡 */}
        <div
          className={`relative px-4 py-2 text-[16px] leading-[22px] ${
            isPlayer
              ? 'bg-[#007AFF] text-white rounded-[18px] rounded-br-[4px]'
              : 'bg-[#E5E5EA] text-black rounded-[18px] rounded-bl-[4px]'
          }`}
        >
          {message.text}
        </div>

        {/* 已读状态 */}
        {isPlayer && isLast && (
          <motion.div
            className="flex items-center justify-end gap-0.5 mt-0.5 px-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-[11px] text-gray-400">{timeStr}</span>
            {message.status === 'read' && (
              <span className="text-[11px] text-gray-400 ml-0.5">已读</span>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
