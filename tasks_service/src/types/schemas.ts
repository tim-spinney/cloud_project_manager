import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  status: z.string().optional(),
  estimate: z.number().nonnegative().optional(),
  projectId: z.string().min(1, 'Project ID is required'),
  assigneeId: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  estimate: z.number().nonnegative().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
});

export const linkTasksSchema = z.object({
  toTaskId: z.string().min(1, 'To task ID is required'),
  descriptor: z.string(),
});

export const createCommentSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  authorId: z.string().min(1, 'Author ID is required'),
  text: z.string().min(1, 'Comment text is required'),
});

export const taskIdParamSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
});

export const projectIdQuerySchema = z.object({
  projectId: z.string().min(1).optional(),
});

