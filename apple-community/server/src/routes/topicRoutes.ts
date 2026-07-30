import { Router } from 'express';
import { asyncHandler, successResponse, ApiError } from '../middleware/errorHandler';
import { topics } from '../data/mockData';

const router = Router();

// Get all topics
router.get('/', asyncHandler((req, res) => {
  const { q = '', sort = 'hot', limit = 50, offset = 0 } = req.query;
  let list = [...topics];

  if (q) {
    const query = (q as string).toLowerCase();
    list = list.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
    );
  }

  if (sort === 'hot') {
    list.sort((a, b) => b.postsCount - a.postsCount);
  }

  successResponse(res, {
    list: list.slice(Number(offset), Number(offset) + Number(limit)),
    total: list.length,
  });
}));

// Get topic by id
router.get('/:id', asyncHandler((req, res) => {
  const topic = topics.find((t) => t.id === req.params.id);
  if (!topic) throw new ApiError('Topic not found', 404);
  successResponse(res, topic);
}));

// Create topic
router.post('/', asyncHandler((req, res) => {
  const { name, description, icon = 'hash', color = 'ios-blue' } = req.body;
  if (!name?.trim()) throw new ApiError('话题名称不能为空', 400);

  const newTopic = {
    id: Date.now().toString(),
    name,
    description: description || '',
    icon,
    color,
    postsCount: 0,
    followersCount: 0,
    isFollowing: false,
  };
  topics.push(newTopic as any);
  successResponse(res, newTopic, '创建成功', 201);
}));

// Follow topic
router.post('/:id/follow', asyncHandler((req, res) => {
  const topic = topics.find((t) => t.id === req.params.id);
  if (!topic) throw new ApiError('Topic not found', 404);

  topic.isFollowing = !topic.isFollowing;
  topic.followersCount += topic.isFollowing ? 1 : -1;

  successResponse(res, {
    isFollowing: topic.isFollowing,
    followersCount: topic.followersCount,
  }, topic.isFollowing ? '关注成功' : '已取消关注');
}));

// Hot topics / trending
router.get('/trending/list', asyncHandler((_req, res) => {
  const trending = [...topics]
    .sort((a, b) => b.postsCount * 1.2 + b.followersCount - (a.postsCount * 1.2 + a.followersCount))
    .slice(0, 10);
  successResponse(res, trending);
}));

export default router;
