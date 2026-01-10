import { TaskLink } from '../types/entities';
import { ITaskLinkRepository } from './interfaces';

export class InMemoryTaskLinkRepository implements ITaskLinkRepository {
  private links: Map<string, TaskLink> = new Map();
  private idCounter = 1;

  async create(link: Omit<TaskLink, 'id' | 'createdAt'>): Promise<TaskLink> {
    const id = `link-${this.idCounter++}`;
    const newLink: TaskLink = {
      ...link,
      id,
      createdAt: new Date(),
    };
    this.links.set(id, newLink);
    return newLink;
  }

  async findByTaskId(taskId: string): Promise<TaskLink[]> {
    return Array.from(this.links.values()).filter(
      link => link.fromTaskId === taskId || link.toTaskId === taskId
    );
  }

  async findByFromTaskId(fromTaskId: string): Promise<TaskLink[]> {
    return Array.from(this.links.values()).filter(link => link.fromTaskId === fromTaskId);
  }

  async findByToTaskId(toTaskId: string): Promise<TaskLink[]> {
    return Array.from(this.links.values()).filter(link => link.toTaskId === toTaskId);
  }

  async delete(id: string): Promise<boolean> {
    return this.links.delete(id);
  }
}

