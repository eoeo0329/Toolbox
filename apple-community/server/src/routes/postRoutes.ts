import { Router } from 'express';
import { asyncHandler, successResponse, ApiError } from '../middleware/errorHandler';
import { posts, users, comments, topics } from '../data/mockData';

const router = Router();

// Get posts list
router.get('/', asyncHandler((req, res) => {
  const {
    sort = 'hot',
    topicId,
    authorId,
    limit = 20,
    offset = 0,
    q = '',
  } = req.query;

  let list = [...posts];

  if (topicId) {
    list = list.filter((p) => p.topicId === topicId);
  }
  if (authorId) {
    list = list.filter((p) => p.authorId === authorId);
  }
  if (q) {
    const query = (q as string).toLowerCase();
    list = list.filter((p) => p.content.toLowerCase().includes(query));
  }

  // Sort
  if (sort === 'hot') {
    list.sort((a, b) => b.likesCount + b.commentsCount * 2 - (a.likesCount + a.commentsCount * 2));
  } else if (sort === 'latest') {
    list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }

  // Enrich with author & topic
  const enriched = list.slice(Number(offset), Number(offset) + Number(limit)).map((post) => {
    const author = users.find((u) => u.id === post.authorId);
    const topic = topics.find((t) => t.id === post.topicId);
    const { password: _pw, ...safeAuthor } = author || ({} as any);
    return {
      ...post,
      author: safeAuthor,
      topic,
    };
  });

  successResponse(res, {
    list: enriched,
    total: list.length,
    limit: Number(limit),
    offset: Number(offset),
  });
}));

// Get post by ID
router.get('/:id', asyncHandler((req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) throw new ApiError('Post not found', 404);

  const author = users.find((u) => u.id === post.authorId);
  const topic = topics.find((t) => t.id === post.topicId);
  const { password: _pw, ...safeAuthor } = author || ({} as any);

  successResponse(res, {
    ...post,
    author: safeAuthor,
    topic,
  });
}));

// Create post
router.post('/', asyncHandler((req, res) => {
  const { authorId, content, images = [], topicId } = req.body;
  if (!authorId || !content?.trim()) {
    throw new ApiError('内容不能为空', 400);
  }

  const newPost = {
    id: Date.now().toString(),
    authorId,
    content,
    images,
    topicId,
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    bookmarksCount: 0,
    viewsCount: 0,
    isLiked: false,
    isBookmarked: false,
    isHot: false,
    isPinned: false,
    createdAt: new Date().toISOString(),
  };
  posts.unshift(newPost as any);

  const author = users.find((u) => u.id === authorId);
  if (author) author.postsCount += 1;

  successResponse(res, newPost, '发布成功', 201);
}));

// Toggle like
router.post('/:id/like', asyncHandler((req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) throw new ApiError('Post not found', 404);

  post.isLiked = !post.isLiked;
  post.likesCount += post.isLiked ? 1 : -1;

  successResponse(res, {
    isLiked: post.isLiked,
    likesCount: post.likesCount,
  });
}));

// Toggle bookmark
router.post('/:id/bookmark', asyncHandler((req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) throw new ApiError('Post not found', 404);

  post.isBookmarked = !post.isBookmarked;
  post.bookmarksCount += post.isBookmarked ? 1 : -1;

  successResponse(res, {
    isBookmarked: post.isBookmarked,
    bookmarksCount: post.bookmarksCount,
  });
}));

// Get comments
router.get('/:id/comments', asyncHandler((req, res) => {
  const postComments = comments.filter((c) => c.postId === req.params.id);
  const enriched = postComments.map((comment) => {
    const author = users.find((u) => u.id === comment.authorId);
    const { password: _pw, ...safeAuthor } = author || ({} as any);
    const enrichedReplies = comment.replies?.map((reply) => {
      const rAuthor = users.find((u) => u.id === reply.authorId);
      const { password: _rpw, ...safeRAuthor } = rAuthor || ({} as any);
      return { ...reply, author: safeRAuthor };
    });
    return { ...comment, author: safeAuthor, replies: enrichedReplies };
  });

  successResponse(res, {
    list: enriched,
    total: enriched.length,
  });
}));

// Add comment
router.post('/:id/comments', asyncHandler((req, res) => {
  const { authorId, content, replyToId } = req.body;
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) throw new ApiError('Post not found', 404);
  if (!content?.trim()) throw new ApiError('评论内容不能为空', 400);

  const newComment = {
    id: Date.now().toString(),
    postId: req.params.id,
    authorId,
    content,
    replyToId,
    replies: [],
    likesCount: 0,
    isLiked: false,
    createdAt: new Date().toISOString(),
  };

  if (replyToId) {
    // Add as reply
    const parent = comments.find((c) => c.id === replyToId);
    if (parent) {
      parent.replies.push(newComment as any);
    }
  } else {
    comments.unshift(newComment as any);
  }
  post.commentsCount += 1;

  successResponse(res, newComment, '评论成功', 201);
}));

// Delete post
router.delete('/:id', asyncHandler((req, res) => {
  const idx = posts.findIndex((p) => p.id === req.params.id);
  if (idx === -1) throw new ApiError('Post not found', 404);
  posts.splice(idx, 1);
  successResponse(res, null, '删除成功');
}));

export default router;
