import { Request, Response } from 'express';
import { ICommentRepository } from '../repositories/interfaces';
import { createCommentSchema, taskIdParamSchema } from '../types/schemas';

export class CommentController {
  constructor(private commentRepository: ICommentRepository) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = createCommentSchema.parse(req.body);
      const comment = await this.commentRepository.create(data);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create comment', details: error });
    }
  };

  getByTaskId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = taskIdParamSchema.parse(req.params);
      const comments = await this.commentRepository.findByTaskId(id);
      res.json(comments);
    } catch (error) {
      res.status(400).json({ error: 'Invalid request', details: error });
    }
  };
}

