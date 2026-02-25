import express, { Express, Request, Response } from 'express';
import { TaskController } from './controllers/task-controller';
import { CommentController } from './controllers/comment-controller';
import { createTaskRoutes } from './routes/task-routes';
import { createCommentRoutes } from './routes/comment-routes';
import { InMemoryTaskRepository } from './repositories/in-memory-task-repository';
import { InMemoryTaskLinkRepository } from './repositories/in-memory-task-link-repository';
import { InMemoryCommentRepository } from './repositories/in-memory-comment-repository';
import { logger } from './logger';
import { recordHttpRequest, shutdownMetrics } from './observability';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use((req: Request, res: Response, next: express.NextFunction) => {
  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;
    const route = req.baseUrl + (req.route?.path ?? req.path);
    const attributes = {
      'http.method': req.method,
      'http.route': route,
      'http.status_code': res.statusCode,
    };

    recordHttpRequest(attributes, durationMs);
    logger.info('request_completed', {
      method: req.method,
      route,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      userAgent: req.get('user-agent') ?? '',
      remoteAddress: req.ip,
    });
  });

  next();
});

// Initialize repositories
const taskRepository = new InMemoryTaskRepository();
const taskLinkRepository = new InMemoryTaskLinkRepository();
const commentRepository = new InMemoryCommentRepository();

// Initialize controllers
const taskController = new TaskController(taskRepository, taskLinkRepository);
const commentController = new CommentController(commentRepository);

// Routes
app.use('/api/tasks', createTaskRoutes(taskController));
app.use('/api/comments', createCommentRoutes(commentController));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
  logger.error('request_failed', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
  });
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const server = app.listen(PORT, () => {
  logger.info('service_started', { port: PORT });
});

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  logger.info('shutdown_signal_received', { signal });
  server.close(async () => {
    await shutdownMetrics();
    logger.info('service_stopped');
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

