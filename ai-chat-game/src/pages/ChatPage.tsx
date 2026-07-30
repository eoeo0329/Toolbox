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
  Info,
} from 'lucide-react';
import type { Message } from '../types';

export default function ChatPage() {
  const navigate = useNavigate();
  const { state, sendMessage } = useGame();
  const [inputValue, setInputValue] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [showRules, setShowRules] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { currentSession } = state;

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

  // 收到消息重置
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
  }, [currentSession?.messages]);

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

  if (!currentSession) {
    return <div className="h-screen bg-ios-bg flex items-center justify-center">加载中...</div>;
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  const lastPlayerId = getLastPlayerMessageId(currentSession.messages);

  return (
    <div className="h-screen flex flex-col bg-ios-bg text-ios-label overflow-hidden">
      {/* ===== 顶部导航栏（iOS 毛玻璃） ===== */}
      <div className="ios-nav-bar shrink-0 z-10">
        {/* 状态栏占位（让出 iPhone 顶部空间） */}
        <div className="h-11" />

        {/* 第一行：返回 + 标题 + 信息按钮 */}
        <div className="flex items-center justify-between px-2 pb-1">
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center gap-0.5 px-1.5 py-1 rounded-full active:bg-black/5"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-7 h-7 text-ios-blue" strokeWidth={2.5} />
          </motion.button>

          <div className="flex-1 text-center">
            <h1 className="text-[17px] font-semibold text-ios-label">TA</h1>
          </div>

          <motion.button
            onClick={() => setShowRules(!showRules)}
            className="p-1.5 rounded-full active:bg-black/5"
            whileTap={{ scale: 0.9 }}
          >
            <Info className="w-6 h-6 text-ios-blue" />
          </motion.button>
        </div>
      </div>

      {/* ===== 在线状态 + 倒计时胶囊 ===== */}
      <div className="px-3 pt-2 pb-1 flex justify-center shrink-0">
        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md rounded-full px-3 py-1.5 shadow-sm border border-black/[0.04]">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-ios-green opacity-75 animate-ping" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-ios-green" />
          </span>
          <span className="text-[12px] text-ios-secondary font-medium">在线</span>
          <span className="text-[12px] text-ios-gray">·</span>
          <motion.span
            className={`text-[12px] font-mono font-semibold ${
              countdown <= 10 ? 'text-ios-red' : 'text-ios-blue'
            }`}
            animate={countdown <= 10 ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 0.5, repeat: countdown <= 10 ? Infinity : 0 }}
          >
            {String(countdown).padStart(2, '0')}秒
          </motion.span>
        </div>
      </div>

      {/* ===== 规则提示（点击右上角 info 显示） ===== */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            className="px-3 pb-2 shrink-0"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-ios-blue/8 rounded-2xl p-3 border border-ios-blue/15">
              <p className="text-[13px] text-ios-secondary leading-relaxed">
                <span className="font-semibold text-ios-blue">挑战规则：</span>
                通过聊天判断对方是「真人」还是「AI」。
                对方超过 60 秒未回复即挑战失败。
                聊天结束后选择答案，揭晓身份。
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 聊天区域 ===== */}
      <div className="flex-1 overflow-y-auto px-3 pt-2 pb-2">
        {/* iMessage 加密提示 */}
        <div className="flex flex-col items-center gap-0.5 mb-3">
          <span className="text-[11px] text-ios-gray font-medium">iMessage 信息</span>
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-ios-gray" />
            <span className="text-[11px] text-ios-gray">已加密</span>
          </div>
        </div>

        {/* 时间分隔线 */}
        <div className="flex justify-center mb-3">
          <span className="text-[11px] text-ios-gray">今天 {timeStr}</span>
        </div>

        {/* 消息列表 */}
        <AnimatePresence initial={false}>
          {currentSession.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLastPlayerMessage={message.id === lastPlayerId}
            />
          ))}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* ===== 底部输入区域 ===== */}
      <div className="shrink-0">
        {/* 倒计时提示（剩余10秒时显示） */}
        {countdown <= 10 && countdown > 0 && (
          <motion.div
            className="flex justify-center py-1 bg-white/60 backdrop-blur"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <span className="text-[12px] text-ios-red font-semibold">
              {countdown} 秒后超时失败
            </span>
          </motion.div>
        )}

        {/* 输入栏 */}
        <div className="flex items-end gap-2 px-3 py-2 bg-ios-bg">
          {/* + 按钮 */}
          <motion.button
            className="w-8 h-8 rounded-full flex items-center justify-center mb-1 shrink-0"
            style={{ background: '#007AFF' }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus className="w-5 h-5 text-white" />
          </motion.button>

          {/* 输入框 */}
          <div className="flex-1 bg-white rounded-full flex items-center px-4 py-2 min-h-[36px] border border-black/[0.04]">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="iMessage 信息"
              className="w-full text-[16px] outline-none bg-transparent placeholder:text-ios-gray"
              autoFocus
            />
          </div>

          {/* 发送/麦克风按钮 */}
          {inputValue.trim() ? (
            <motion.button
              onClick={handleSendMessage}
              className="w-8 h-8 rounded-full flex items-center justify-center mb-1 shrink-0"
              style={{ background: '#007AFF' }}
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
              <Mic className="w-6 h-6 text-ios-blue" />
            </motion.button>
          )}
        </div>

        {/* 结束聊天 */}
        <button
          onClick={handleEndChat}
          className="w-full text-center text-[11px] text-ios-gray py-1.5 bg-ios-bg"
        >
          结束聊天，做出判断
        </button>
      </div>
    </div>
  );
}

// 找到最后一条发送的消息ID，用于显示已读状态
function getLastPlayerMessageId(messages: Message[]) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].sender === 'player') return messages[i].id;
  }
  return null;
}

// ===== iMessage 真实气泡组件 =====
function MessageBubble({
  message,
  isLastPlayerMessage,
}: {
  message: Message;
  isLastPlayerMessage: boolean;
}) {
  const isPlayer = message.sender === 'player';
  const timeStr = message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`flex ${isPlayer ? 'justify-end' : 'justify-start'} mb-0.5`}
    >
      <div className="flex flex-col max-w-[75%]">
        <div className={isPlayer ? 'bubble-sent' : 'bubble-received'}>
          <span className="text-[16px] leading-[22px] whitespace-pre-wrap break-words">
            {message.text}
          </span>
        </div>

        {/* 已读状态 - 只在最后一条发送消息显示 */}
        {isPlayer && isLastPlayerMessage && message.status === 'read' && (
          <motion.div
            className="flex items-center justify-end gap-1 mt-0.5 px-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-[11px] text-ios-gray">{timeStr} 已读</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
