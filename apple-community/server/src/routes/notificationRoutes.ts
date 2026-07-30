import { Router } from 'express';
import { asyncHandler, successResponse } from '../middleware/errorHandler';
import { notifications, users } from '../data/mockData';

const router = Router();

// Get notifications
router.get('/', asyncHandler((req, res) => {
  const { userId = '1', limit = 30, offset = 0, type } = req.query;

  let list = [...notifications];
  if (type) {
    list = list.filter((n) => n.type === type);
  }

  const enriched = list.map((n) => {
    const fromUser = n.fromUserId ? users.find((u) => u.id === n.fromUserId) : null;
    const safeUser = fromUser ? (() => {
      const { password, ...rest } = fromUser;
      return rest;
    })() : undefined;
    return { ...n, fromUser: safeUser };
  });

  const unreadCount = enriched.filter((n) => !n.isRead).length;

  successResponse(res, {
    list: enriched.slice(Number(offset), Number(offset) + Number(limit)),
    total: enriched.length,
    unreadCount,
  });
}));

// Get unread count
router.get('/unread/count', asyncHandler((_req, res) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  successResponse(res, { count: unreadCount });
}));

// Mark as read
router.post('/:id/read', asyncHandler((req, res) => {
  const notif = notifications.find((n) => n.id === req.params.id);
  if (notif) notif.isRead = true;
  successResponse(res, null, '已标记为已读');
}));

// Mark all as read
router.post('/read/all', asyncHandler((_req, res) => {
  notifications.forEach((n) => (n.isRead = true));
  successResponse(res, null, '全部已读');
}));

export default router;
