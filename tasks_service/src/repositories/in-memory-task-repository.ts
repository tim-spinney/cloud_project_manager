import { Task } from '../types/entities';
import { ITaskRepository } from './interfaces';

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

  async findByProjectId(projectId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.projectId === projectId);
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

  async findAll(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }
}

