import express, { Express, Request, Response } from 'express';
import { TaskController } from './controllers/task-controller';
import { CommentController } from './controllers/comment-controller';
import { createTaskRoutes } from './routes/task-routes';
import { createCommentRoutes } from './routes/comment-routes';
import { InMemoryTaskRepository } from './repositories/in-memory-task-repository';
import { InMemoryTaskLinkRepository } from './repositories/in-memory-task-link-repository';
import { InMemoryCommentRepository } from './repositories/in-memory-comment-repository';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

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
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Tasks service is running on port ${PORT}`);
});

