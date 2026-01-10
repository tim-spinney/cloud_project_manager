import { Router } from 'express';
import { CommentController } from '../controllers/comment-controller';
import { validate, validateParams } from '../middleware/validation';
import { createCommentSchema, taskIdParamSchema } from '../types/schemas';

export function createCommentRoutes(commentController: CommentController): Router {
  const router = Router();

  router.post('/', validate(createCommentSchema), commentController.create);
  router.get('/task/:id', validateParams(taskIdParamSchema), commentController.getByTaskId);

  return router;
}

