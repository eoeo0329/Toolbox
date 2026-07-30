import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Send, Check, CheckCheck, ChevronLeft } from 'lucide-react';
import type { Message } from '../types';

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
          // 超时，游戏失败
          navigate('/result?timeout=true');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSession, navigate]);

  // 收到消息时重置倒计时
  useEffect(() => {
    if (currentSession && currentSession.messages.length > 0) {
      const lastMessage = currentSession.messages[currentSession.messages.length - 1];
      if (lastMessage.sender === 'opponent') {
        setCountdown(60);
      }
    }
  }, [currentSession?.messages]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, isTyping]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !currentSession) return;

    sendMessage(inputValue.trim());
    setInputValue('');
    setCountdown(60);

    // 重新聚焦输入框
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleEndChat = () => {
    navigate('/judge');
  };

  if (!currentSession) {
    return <div>加载中...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 顶部栏 */}
      <div className="glass-card rounded-none border-t-0 border-x-0 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentSession.partner.avatar}
                alt={currentSession.partner.name}
                className="w-10 h-10 rounded-full"
              />
              {currentSession.partner.isOnline && (
                <motion.div
                  className="absolute -bottom-0.5 -right-0.5 online-indicator"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                />
              )}
            </div>
            <div>
              <h2 className="font-semibold">{currentSession.partner.name}</h2>
              <p className="text-xs text-white/60">
                {isTyping ? '正在输入...' : '在线'}
              </p>
            </div>
          </div>
        </div>

        {/* 倒计时 */}
        <motion.div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            countdown <= 10
              ? 'bg-red-500/30 text-red-400'
              : 'bg-white/10 text-white/60'
          }`}
          animate={countdown <= 10 ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5, repeat: countdown <= 10 ? Infinity : 0 }}
        >
          <span className="text-sm font-mono">{countdown}s</span>
        </motion.div>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
            className="flex justify-start"
          >
            <div className="message-bubble message-received">
              <div className="typing-indicator flex gap-1">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 底部输入区域 */}
      <div className="glass-card rounded-none border-b-0 border-x-0 p-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="输入消息..."
            className="flex-1 glass-input"
            autoFocus
          />
          <motion.button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-12 h-12 flex items-center justify-center disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>

        {/* 结束聊天按钮 */}
        <motion.button
          onClick={handleEndChat}
          className="w-full mt-3 py-2 text-sm text-white/60 hover:text-white transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          结束聊天，做出判断
        </motion.button>
      </div>
    </div>
  );
}

// 消息气泡组件
function MessageBubble({ message, isLast }: { message: Message; isLast: boolean }) {
  const isPlayer = message.sender === 'player';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`flex ${isPlayer ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`message-bubble ${isPlayer ? 'message-sent' : 'message-received'}`}>
        <p className="text-sm md:text-base">{message.text}</p>

        {/* 消息状态 */}
        {isPlayer && (
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-xs text-white/40">
              {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <MessageStatus status={message.status} isLast={isLast} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// 消息状态组件
function MessageStatus({ status, isLast }: { status?: string; isLast: boolean }) {
  if (!status) return null;

  return (
    <motion.div
      key={status}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 500 }}
    >
      {status === 'sent' && <Check className="w-3 h-3 text-white/40" />}
      {status === 'delivered' && <CheckCheck className="w-3 h-3 text-white/40" />}
      {status === 'read' && <CheckCheck className="w-3 h-3 text-blue-400" />}
    </motion.div>
  );
}