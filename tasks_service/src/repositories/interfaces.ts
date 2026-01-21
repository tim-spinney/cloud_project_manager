import { Task, TaskLink, Comment } from '../types/entities';

export interface PaginatedResult<T> {
  items: T[];
  nextPageToken?: string;
}

export interface PaginationOptions {
  limit: number;
  pageToken?: string;
}

export interface ITaskRepository {
  create(task: Omit<Task, 'id' | 'createdAt' | 'lastModifiedAt'>): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findByProjectId(projectId: string, options?: PaginationOptions): Promise<PaginatedResult<Task>>;
  update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'projectId' | 'lastModifiedAt'>>): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
}

export interface ITaskLinkRepository {
  create(link: Omit<TaskLink, 'id' | 'createdAt'>): Promise<TaskLink>;
  findByTaskId(taskId: string, options?: PaginationOptions): Promise<PaginatedResult<TaskLink>>;
  findByFromTaskId(fromTaskId: string, options?: PaginationOptions): Promise<PaginatedResult<TaskLink>>;
  findByToTaskId(toTaskId: string, options?: PaginationOptions): Promise<PaginatedResult<TaskLink>>;
  delete(id: string): Promise<boolean>;
}

export interface ICommentRepository {
  create(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment>;
  findByTaskId(taskId: string, options?: PaginationOptions): Promise<PaginatedResult<Comment>>;
  delete(id: string): Promise<boolean>;
}

