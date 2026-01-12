import { Request, Response } from 'express';
import { ITaskRepository, ITaskLinkRepository } from '../repositories/interfaces';
import {
  createTaskSchema,
  updateTaskSchema,
  linkTasksSchema,
  taskIdParamSchema,
  projectIdQuerySchema,
} from '../types/schemas';

export class TaskController {
  constructor(
    private taskRepository: ITaskRepository,
    private taskLinkRepository: ITaskLinkRepository
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = createTaskSchema.parse(req.body);
      const task = await this.taskRepository.create(data);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create task', details: error });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = taskIdParamSchema.parse(req.params);
      const task = await this.taskRepository.findById(id);

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.json(task);
    } catch (error) {
      res.status(400).json({ error: 'Invalid request', details: error });
    }
  };

  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = projectIdQuerySchema.parse(req.query);
      
      if (projectId) {
        const tasks = await this.taskRepository.findByProjectId(projectId);
        res.json(tasks);
      } else {
        const tasks = await this.taskRepository.findAll();
        res.json(tasks);
      }
    } catch (error) {
      res.status(400).json({ error: 'Invalid request', details: error });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = taskIdParamSchema.parse(req.params);
      const data = updateTaskSchema.parse(req.body);

      // Convert null to undefined for optional fields
      const updateData = {
        ...data,
        estimate: data.estimate === null ? undefined : data.estimate,
        assigneeId: data.assigneeId === null ? undefined : data.assigneeId,
      };

      const updatedTask = await this.taskRepository.update(id, updateData);

      if (!updatedTask) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.json(updatedTask);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update task', details: error });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = taskIdParamSchema.parse(req.params);
      const deleted = await this.taskRepository.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Failed to delete task', details: error });
    }
  };

  linkTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id: fromTaskId } = taskIdParamSchema.parse(req.params);
      const data = linkTasksSchema.parse(req.body);

      // Verify both tasks exist
      const fromTask = await this.taskRepository.findById(fromTaskId);
      const toTask = await this.taskRepository.findById(data.toTaskId);

      if (!fromTask) {
        res.status(404).json({ error: 'From task not found' });
        return;
      }

      if (!toTask) {
        res.status(404).json({ error: 'To task not found' });
        return;
      }

      const link = await this.taskLinkRepository.create({
        fromTaskId,
        toTaskId: data.toTaskId,
        descriptor: data.descriptor,
      });
      res.status(201).json(link);
    } catch (error) {
      res.status(400).json({ error: 'Failed to link tasks', details: error });
    }
  };

  getTaskLinks = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = taskIdParamSchema.parse(req.params);
      const links = await this.taskLinkRepository.findByTaskId(id);
      res.json(links);
    } catch (error) {
      res.status(400).json({ error: 'Invalid request', details: error });
    }
  };
}

