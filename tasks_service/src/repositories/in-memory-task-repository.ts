import { Task } from '../types/entities';
import { ITaskRepository, PaginatedResult, PaginationOptions } from './interfaces';
import { decodePageToken, encodePageToken } from './pagination-utils';

export class InMemoryTaskRepository implements ITaskRepository {
  private tasks: Map<string, Task> = new Map();
  private idCounter = 1;

  async create(task: Omit<Task, 'id' | 'createdAt' | 'lastModifiedAt'>): Promise<Task> {
    const id = `task-${this.idCounter++}`;
    const now = new Date();
    const newTask: Task = {
      ...task,
      id,
      createdAt: now,
      lastModifiedAt: now,
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async findById(id: string): Promise<Task | null> {
    return this.tasks.get(id) || null;
  }

  async findByProjectId(projectId: string, options?: PaginationOptions): Promise<PaginatedResult<Task>> {
    const allTasks = Array.from(this.tasks.values()).filter(task => task.projectId === projectId);
    
    const limit = Math.min(Math.max(options?.limit || 20, 1), 100);
    
    // Find starting position based on pageToken
    let startIndex = 0;
    if (options?.pageToken) {
      const decodedToken = decodePageToken(options.pageToken);
      if (decodedToken?.id) {
        const tokenIndex = allTasks.findIndex(task => task.id === decodedToken.id);
        if (tokenIndex >= 0) {
          startIndex = tokenIndex + 1; // Start after the token item
        }
      }
    }
    
    const items = allTasks.slice(startIndex, startIndex + limit);
    const hasMore = allTasks.length > startIndex + limit;
    
    // Use the last item's ID as the next page token
    const nextPageToken = hasMore && items.length > 0
      ? encodePageToken({ id: items[items.length - 1].id })
      : undefined;
    
    return {
      items,
      nextPageToken,
    };
  }

  async update(
    id: string,
    updates: Partial<Omit<Task, 'id' | 'createdAt' | 'projectId' | 'lastModifiedAt'>>
  ): Promise<Task | null> {
    const task = this.tasks.get(id);
    if (!task) {
      return null;
    }

    const updatedTask: Task = {
      ...task,
      ...updates,
      lastModifiedAt: new Date(),
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async delete(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

}

