import { TaskLink } from '../types/entities';
import { ITaskLinkRepository, PaginatedResult, PaginationOptions } from './interfaces';
import { decodePageToken, encodePageToken } from './pagination-utils';

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

  async findByTaskId(taskId: string, options?: PaginationOptions): Promise<PaginatedResult<TaskLink>> {
    const allLinks = Array.from(this.links.values()).filter(
      link => link.fromTaskId === taskId || link.toTaskId === taskId
    );
    
    const limit = Math.min(Math.max(options?.limit || 20, 1), 100);
    
    let startIndex = 0;
    if (options?.pageToken) {
      const decodedToken = decodePageToken(options.pageToken);
      if (decodedToken?.id) {
        const tokenIndex = allLinks.findIndex(link => link.id === decodedToken.id);
        if (tokenIndex >= 0) {
          startIndex = tokenIndex + 1;
        }
      }
    }
    
    const items = allLinks.slice(startIndex, startIndex + limit);
    const hasMore = allLinks.length > startIndex + limit;
    
    const nextPageToken = hasMore && items.length > 0
      ? encodePageToken({ id: items[items.length - 1].id })
      : undefined;
    
    return {
      items,
      nextPageToken,
    };
  }

  async findByFromTaskId(fromTaskId: string, options?: PaginationOptions): Promise<PaginatedResult<TaskLink>> {
    const allLinks = Array.from(this.links.values()).filter(link => link.fromTaskId === fromTaskId);
    
    const limit = Math.min(Math.max(options?.limit || 20, 1), 100);
    
    let startIndex = 0;
    if (options?.pageToken) {
      const decodedToken = decodePageToken(options.pageToken);
      if (decodedToken?.id) {
        const tokenIndex = allLinks.findIndex(link => link.id === decodedToken.id);
        if (tokenIndex >= 0) {
          startIndex = tokenIndex + 1;
        }
      }
    }
    
    const items = allLinks.slice(startIndex, startIndex + limit);
    const hasMore = allLinks.length > startIndex + limit;
    
    const nextPageToken = hasMore && items.length > 0
      ? encodePageToken({ id: items[items.length - 1].id })
      : undefined;
    
    return {
      items,
      nextPageToken,
    };
  }

  async findByToTaskId(toTaskId: string, options?: PaginationOptions): Promise<PaginatedResult<TaskLink>> {
    const allLinks = Array.from(this.links.values()).filter(link => link.toTaskId === toTaskId);
    
    const limit = Math.min(Math.max(options?.limit || 20, 1), 100);
    
    let startIndex = 0;
    if (options?.pageToken) {
      const decodedToken = decodePageToken(options.pageToken);
      if (decodedToken?.id) {
        const tokenIndex = allLinks.findIndex(link => link.id === decodedToken.id);
        if (tokenIndex >= 0) {
          startIndex = tokenIndex + 1;
        }
      }
    }
    
    const items = allLinks.slice(startIndex, startIndex + limit);
    const hasMore = allLinks.length > startIndex + limit;
    
    const nextPageToken = hasMore && items.length > 0
      ? encodePageToken({ id: items[items.length - 1].id })
      : undefined;
    
    return {
      items,
      nextPageToken,
    };
  }

  async delete(id: string): Promise<boolean> {
    return this.links.delete(id);
  }
}

