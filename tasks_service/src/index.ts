import express, { Express, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { parse as parseYaml } from 'yaml';
import { TaskController } from './controllers/task-controller';
import { CommentController } from './controllers/comment-controller';
import { createTaskRoutes } from './routes/task-routes';
import { createCommentRoutes } from './routes/comment-routes';
import { ITaskRepository, ITaskLinkRepository, ICommentRepository } from './repositories/interfaces';
import { InMemoryTaskRepository } from './repositories/in-memory-task-repository';
import { InMemoryTaskLinkRepository } from './repositories/in-memory-task-link-repository';
import { InMemoryCommentRepository } from './repositories/in-memory-comment-repository';
import { DynamoDBTaskRepository } from './repositories/dynamodb-task-repository';
import { DynamoDBTaskLinkRepository } from './repositories/dynamodb-task-link-repository';
import { DynamoDBCommentRepository } from './repositories/dynamodb-comment-repository';

// Load environment variables
dotenv.config();

// ENABLE_SWAGGER_UI: set to 'true' or '1' to serve Swagger UI and OpenAPI spec; set to 'false' to disable (e.g. in production).
const enableSwaggerUi = process.env.ENABLE_SWAGGER_UI !== 'false' && process.env.ENABLE_SWAGGER_UI !== '0';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Initialize repositories based on environment
const useDynamoDB = process.env.USE_DYNAMODB === 'true' || process.env.USE_DYNAMODB === '1';

let taskRepository: ITaskRepository;
let taskLinkRepository: ITaskLinkRepository;
let commentRepository: ICommentRepository;

if (useDynamoDB) {
  console.log('Using DynamoDB repositories');
  taskRepository = new DynamoDBTaskRepository();
  taskLinkRepository = new DynamoDBTaskLinkRepository();
  commentRepository = new DynamoDBCommentRepository();
} else {
  console.log('Using in-memory repositories');
  taskRepository = new InMemoryTaskRepository();
  taskLinkRepository = new InMemoryTaskLinkRepository();
  commentRepository = new InMemoryCommentRepository();
}

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

// API docs and Swagger UI (disabled when ENABLE_SWAGGER_UI is false, e.g. in production)
if (enableSwaggerUi) {
  const openApiPath = path.join(__dirname, '..', 'openapi.yaml');
  const openApiSpec = parseYaml(fs.readFileSync(openApiPath, 'utf8'));
  app.get('/api-docs/openapi.yaml', (_req: Request, res: Response) => {
    res.type('application/yaml').send(fs.readFileSync(openApiPath, 'utf8'));
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
}

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Tasks service is running on port ${PORT}`);
  if (enableSwaggerUi) {
    console.log(`API docs: http://localhost:${PORT}/api-docs`);
  }
});

