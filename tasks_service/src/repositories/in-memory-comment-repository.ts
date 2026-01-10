import { Comment } from '../types/entities';
import { ICommentRepository } from './interfaces';

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

  async findByTaskId(taskId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.taskId === taskId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async findById(id: string): Promise<Comment | null> {
    return this.comments.get(id) || null;
  }

  async delete(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }
}

