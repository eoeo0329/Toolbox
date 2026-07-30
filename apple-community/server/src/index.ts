import express from 'express';
import cors from 'cors';
import path from 'path';
import { userRoutes, postRoutes, topicRoutes, messageRoutes, notificationRoutes, uploadRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'Apple Community API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      posts: '/api/posts',
      topics: '/api/topics',
      messages: '/api/messages',
      notifications: '/api/notifications',
      upload: '/api/upload',
    },
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Apple Community API Server running at http://localhost:${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/\n`);
});

export default app;
