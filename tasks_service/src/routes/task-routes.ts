import { Router } from 'express';
import { TaskController } from '../controllers/task-controller';
import { validate, validateParams, validateQuery } from '../middleware/validation';
import {
  createTaskSchema,
  updateTaskSchema,
  linkTasksSchema,
  taskIdParamSchema,
  projectIdQuerySchema,
} from '../types/schemas';

export function createTaskRoutes(taskController: TaskController): Router {
  const router = Router();

  router.post('/', validate(createTaskSchema), taskController.create);
  router.get('/', validateQuery(projectIdQuerySchema), taskController.getByProject);
  router.post('/:id/links', validateParams(taskIdParamSchema), validate(linkTasksSchema), taskController.linkTasks);
  router.get('/:id/links', validateParams(taskIdParamSchema), taskController.getTaskLinks);
  router.get('/:id', validateParams(taskIdParamSchema), taskController.getById);
  router.patch('/:id', validateParams(taskIdParamSchema), validate(updateTaskSchema), taskController.update);
  router.delete('/:id', validateParams(taskIdParamSchema), taskController.delete);

  return router;
}

