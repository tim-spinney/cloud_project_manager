import { Task, TaskLink, Comment } from '../types/entities';

export interface ITaskRepository {
  create(task: Omit<Task, 'id' | 'createdAt' | 'lastModifiedAt'>): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findByProjectId(projectId: string): Promise<Task[]>;
  update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'projectId' | 'lastModifiedAt'>>): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
  findAll(): Promise<Task[]>;
}

export interface ITaskLinkRepository {
  create(link: Omit<TaskLink, 'id' | 'createdAt'>): Promise<TaskLink>;
  findByTaskId(taskId: string): Promise<TaskLink[]>;
  findByFromTaskId(fromTaskId: string): Promise<TaskLink[]>;
  findByToTaskId(toTaskId: string): Promise<TaskLink[]>;
  delete(id: string): Promise<boolean>;
}

export interface ICommentRepository {
  create(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment>;
  findByTaskId(taskId: string): Promise<Comment[]>;
  findById(id: string): Promise<Comment | null>;
  delete(id: string): Promise<boolean>;
}

