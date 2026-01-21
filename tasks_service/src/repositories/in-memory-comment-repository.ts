import { Comment } from '../types/entities';
import { ICommentRepository, PaginatedResult, PaginationOptions } from './interfaces';
import { decodePageToken, encodePageToken } from './pagination-utils';

export class InMemoryCommentRepository implements ICommentRepository {
  private comments: Map<string, Comment> = new Map();
  private idCounter = 1;

  async create(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    const id = `comment-${this.idCounter++}`;
    const newComment: Comment = {
      ...comment,
      id,
      createdAt: new Date(),
    };
    this.comments.set(id, newComment);
    return newComment;
  }

  async findByTaskId(taskId: string, options?: PaginationOptions): Promise<PaginatedResult<Comment>> {
    const allComments = Array.from(this.comments.values())
      .filter(comment => comment.taskId === taskId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    const limit = Math.min(Math.max(options?.limit || 20, 1), 100);
    
    let startIndex = 0;
    if (options?.pageToken) {
      const decodedToken = decodePageToken(options.pageToken);
      if (decodedToken?.id) {
        const tokenIndex = allComments.findIndex(comment => comment.id === decodedToken.id);
        if (tokenIndex >= 0) {
          startIndex = tokenIndex + 1;
        }
      }
    }
    
    const items = allComments.slice(startIndex, startIndex + limit);
    const hasMore = allComments.length > startIndex + limit;
    
    const nextPageToken = hasMore && items.length > 0
      ? encodePageToken({ id: items[items.length - 1].id })
      : undefined;
    
    return {
      items,
      nextPageToken,
    };
  }

  async delete(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }
}

