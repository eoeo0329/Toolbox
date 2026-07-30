import { Router } from 'express';
import { asyncHandler, successResponse, ApiError } from '../middleware/errorHandler';
import { users } from '../data/mockData';

const router = Router();

// Helper: remove password from user object
const sanitizeUser = (user: any) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

// Get user by ID
router.get('/:id', asyncHandler((req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) throw new ApiError('User not found', 404);
  successResponse(res, sanitizeUser(user));
}));

// Get current user profile
router.get('/me/profile', asyncHandler((req, res) => {
  // For demo, return the first user
  const user = users[0];
  successResponse(res, sanitizeUser(user));
}));

// Login
router.post('/login', asyncHandler((req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => (u.username === username || u.uid === username) && u.password === password
  );
  if (!user) throw new ApiError('用户名或密码错误', 401);

  successResponse(
    res,
    {
      user: sanitizeUser(user),
      token: `demo-token-${user.id}-${Date.now()}`,
    },
    '登录成功'
  );
}));

// Register
router.post('/register', asyncHandler((req, res) => {
  const { username, nickname, password } = req.body;
  if (!username || !nickname || !password) {
    throw new ApiError('请填写完整信息', 400);
  }
  if (users.some((u) => u.username === username)) {
    throw new ApiError('用户名已存在', 400);
  }

  const newUser = {
    id: Date.now().toString(),
    uid: 'UID' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    username,
    nickname,
    password,
    avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
    bio: '',
    level: 1,
    points: 0,
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    isFollowing: false,
    isVerified: false,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser as any);

  successResponse(
    res,
    {
      user: sanitizeUser(newUser),
      token: `demo-token-${newUser.id}-${Date.now()}`,
    },
    '注册成功',
    201
  );
}));

// Search users
router.get('/', asyncHandler((req, res) => {
  const { q = '', limit = 20, offset = 0 } = req.query;
  const query = (q as string).toLowerCase();

  let filtered = users;
  if (query) {
    filtered = users.filter(
      (u) =>
        u.nickname.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query) ||
        u.bio.toLowerCase().includes(query)
    );
  }

  const page = filtered.slice(Number(offset), Number(offset) + Number(limit));
  successResponse(res, {
    list: page.map(sanitizeUser),
    total: filtered.length,
    limit: Number(limit),
    offset: Number(offset),
  });
}));

// Update user profile
router.put('/:id', asyncHandler((req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) throw new ApiError('User not found', 404);

  Object.assign(user, req.body);
  successResponse(res, sanitizeUser(user), '更新成功');
}));

// Toggle follow
router.post('/:id/follow', asyncHandler((req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) throw new ApiError('User not found', 404);

  user.isFollowing = !user.isFollowing;
  if (user.isFollowing) {
    user.followersCount += 1;
  } else {
    user.followersCount = Math.max(0, user.followersCount - 1);
  }

  successResponse(
    res,
    { isFollowing: user.isFollowing, followersCount: user.followersCount },
    user.isFollowing ? '关注成功' : '已取消关注'
  );
}));

export default router;
