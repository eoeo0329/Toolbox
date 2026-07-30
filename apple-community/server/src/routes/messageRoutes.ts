import { Router } from 'express';
import { asyncHandler, successResponse, ApiError } from '../middleware/errorHandler';
import { messages, users } from '../data/mockData';

const router = Router();

// Get conversations
router.get('/conversations', asyncHandler((req, res) => {
  const userId = req.query.userId || '1';
  // Build mock conversations from users
  const conversations = users
    .filter((u) => u.id !== userId)
    .map((user, idx) => {
      const lastMsg = messages[messages.length - 1 - idx] || messages[0];
      return {
        id: `conv-${user.id}`,
        participantId: user.id,
        participant: (() => {
          const { password, ...rest } = user;
          return rest;
        })(),
        lastMessage: lastMsg,
        unreadCount: idx < 2 ? idx + 1 : 0,
        updatedAt: lastMsg?.createdAt || new Date().toISOString(),
      };
    });

  successResponse(res, { list: conversations, total: conversations.length });
}));

// Get messages for a conversation
router.get('/:conversationId', asyncHandler((req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  // Mock conversation messages
  const conversationMessages = [
    { id: 'm1', senderId: '2', receiverId: '1', content: '嗨，最近在忙什么？', type: 'text' as const, isRead: true, createdAt: '2026-07-29T09:00:00Z' },
    { id: 'm2', senderId: '1', receiverId: '2', content: '在做一个新项目，iOS 风格的社区 App', type: 'text' as const, isRead: true, createdAt: '2026-07-29T09:05:00Z' },
    { id: 'm3', senderId: '2', receiverId: '1', content: '听起来很酷！有参考 Apple HIG 吗？', type: 'text' as const, isRead: true, createdAt: '2026-07-29T09:10:00Z' },
    { id: 'm4', senderId: '1', receiverId: '2', content: '当然，每个细节都按规范来的', type: 'text' as const, isRead: true, createdAt: '2026-07-29T09:15:00Z' },
    ...messages,
  ];

  const paginated = conversationMessages.slice(
    Number(offset),
    Number(offset) + Number(limit)
  );

  successResponse(res, {
    list: paginated,
    total: conversationMessages.length,
  });
}));

// Send message
router.post('/send', asyncHandler((req, res) => {
  const { senderId, receiverId, content, type = 'text' } = req.body;
  if (!senderId || !receiverId || !content?.trim()) {
    throw new ApiError('消息内容不能为空', 400);
  }

  const newMsg = {
    id: Date.now().toString(),
    senderId,
    receiverId,
    content,
    type,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMsg as any);

  successResponse(res, newMsg, '发送成功', 201);
}));

// Mark messages as read
router.post('/:conversationId/read', asyncHandler((_req, res) => {
  messages.forEach((m) => (m.isRead = true));
  successResponse(res, null, '已标记为已读');
}));

export default router;
