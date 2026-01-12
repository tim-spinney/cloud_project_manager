import { Request, Response } from 'express';
import { mock, describe, beforeEach, it, expect } from 'bun:test';
import { TaskController } from '../../src/controllers/task-controller';
import { ITaskRepository, ITaskLinkRepository } from '../../src/repositories/interfaces';
import { Task, TaskLink } from '../../src/types/entities';

// Helper type to convert interface methods to mock functions
type Mocked<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? ReturnType<typeof mock> & T[K]
    : T[K];
};

describe('TaskController', () => {
  let taskController: TaskController;
  let mockTaskRepository: Mocked<ITaskRepository>;
  let mockTaskLinkRepository: Mocked<ITaskLinkRepository>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: ReturnType<typeof mock>;
  let responseStatus: ReturnType<typeof mock>;

  beforeEach(() => {
    // Create mock repositories
    mockTaskRepository = {
      create: mock(),
      findById: mock(),
      findByProjectId: mock(),
      update: mock(),
      delete: mock(),
      findAll: mock(),
    };

    mockTaskLinkRepository = {
      create: mock(),
      findByTaskId: mock(),
      findByFromTaskId: mock(),
      findByToTaskId: mock(),
      delete: mock(),
    };

    taskController = new TaskController(mockTaskRepository, mockTaskLinkRepository);

    // Setup mock response
    responseJson = mock();
    const responseSend = mock();
    responseStatus = mock();
    
    // Create the response object first
    mockResponse = {
      status: responseStatus,
      json: responseJson,
      send: responseSend,
    };
    
    // Make status() return the response object for chaining (Express behavior)
    responseStatus.mockImplementation((statusCode: number) => mockResponse as any);
    
    // Make json() and send() return the response object for chaining
    responseJson.mockReturnValue(mockResponse as any);
    responseSend.mockReturnValue(mockResponse as any);

    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
  });

  describe('create', () => {
    describe('when called with a task object with necessary fields filled in with valid data', () => {
      it('saves the task to the repository and returns 201', async () => {
        const validTaskData = {
          title: 'Test Task',
          description: 'Test Description',
          projectId: 'project-123',
        };

        const createdTask: Task = {
          id: 'task-123',
          title: 'Test Task',
          description: 'Test Description',
          projectId: 'project-123',
          createdAt: new Date(),
          lastModifiedAt: new Date(),
        };

        mockRequest.body = validTaskData;
        mockTaskRepository.create.mockResolvedValue(createdTask);

        await taskController.create(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.create).toHaveBeenCalledWith(validTaskData);
        expect(responseStatus).toHaveBeenCalledWith(201);
        expect(responseJson).toHaveBeenCalledWith(createdTask);
      });
    });

    describe('when called with extraneous fields', () => {
      it('does not save the extraneous fields to the repository and returns 201', async () => {
        const taskDataWithExtraneousFields = {
          title: 'Test Task',
          description: 'Test Description',
          projectId: 'project-123',
          extraneousField: 'should not be saved',
          anotherExtraField: 12345,
        };

        const createdTask: Task = {
          id: 'task-123',
          title: 'Test Task',
          description: 'Test Description',
          projectId: 'project-123',
          createdAt: new Date(),
          lastModifiedAt: new Date(),
        };

        mockRequest.body = taskDataWithExtraneousFields;
        mockTaskRepository.create.mockResolvedValue(createdTask);

        await taskController.create(mockRequest as Request, mockResponse as Response);

        // Verify that create was called, but check that extraneous fields are not passed
        expect(mockTaskRepository.create).toHaveBeenCalled();
        const createCallArgs = mockTaskRepository.create.mock.calls[0][0];
        expect(createCallArgs).not.toHaveProperty('extraneousField');
        expect(createCallArgs).not.toHaveProperty('anotherExtraField');
        expect(createCallArgs).toHaveProperty('title');
        expect(createCallArgs).toHaveProperty('description');
        expect(createCallArgs).toHaveProperty('projectId');
        expect(responseStatus).toHaveBeenCalledWith(201);
        expect(responseJson).toHaveBeenCalledWith(createdTask);
      });
    });

    describe('when called with missing fields', () => {
      it('does not save the task to the repository and returns 400', async () => {
        const invalidTaskData = {
          title: 'Test Task',
          // Missing required projectId
        };

        mockRequest.body = invalidTaskData;

        await taskController.create(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.create).not.toHaveBeenCalled();
        expect(responseStatus).toHaveBeenCalledWith(400);
        expect(responseJson).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Failed to create task',
          })
        );
      });

      it('returns 400 when title is missing', async () => {
        const invalidTaskData = {
          description: 'Test Description',
          projectId: 'project-123',
        };

        mockRequest.body = invalidTaskData;

        await taskController.create(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.create).not.toHaveBeenCalled();
        expect(responseStatus).toHaveBeenCalledWith(400);
        expect(responseJson).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Failed to create task',
          })
        );
      });

      it('returns 400 when title is empty string', async () => {
        const invalidTaskData = {
          title: '',
          description: 'Test Description',
          projectId: 'project-123',
        };

        mockRequest.body = invalidTaskData;

        await taskController.create(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.create).not.toHaveBeenCalled();
        expect(responseStatus).toHaveBeenCalledWith(400);
        expect(responseJson).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Failed to create task',
          })
        );
      });
    });
  });

  describe('getById', () => {
    describe('when called with an id matching an existing task in the repository', () => {
      it('sends back the matching task', async () => {
        const taskId = 'task-123';
        const existingTask: Task = {
          id: taskId,
          title: 'Existing Task',
          description: 'Existing Description',
          projectId: 'project-123',
          createdAt: new Date(),
          lastModifiedAt: new Date(),
        };

        mockRequest.params = { id: taskId };
        mockTaskRepository.findById.mockResolvedValue(existingTask);

        await taskController.getById(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
        expect(responseJson).toHaveBeenCalledWith(existingTask);
        expect(responseStatus).not.toHaveBeenCalled();
      });
    });

    describe('when called with an id not matching an existing task', () => {
      it('sends back a 404 response code', async () => {
        const taskId = 'non-existent-task';
        
        mockRequest.params = { id: taskId };
        mockTaskRepository.findById.mockResolvedValue(null);

        await taskController.getById(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
        expect(responseStatus).toHaveBeenCalledWith(404);
        expect(responseJson).toHaveBeenCalledWith({ error: 'Task not found' });
      });
    });
  });

  describe('list', () => {
    describe('when called with no projectId and there are no tasks in the repository', () => {
      it('sends back an empty array', async () => {
        mockRequest.query = {};
        mockTaskRepository.findAll.mockResolvedValue([]);

        await taskController.list(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.findAll).toHaveBeenCalled();
        expect(mockTaskRepository.findByProjectId).not.toHaveBeenCalled();
        expect(responseJson).toHaveBeenCalledWith([]);
        expect(responseStatus).not.toHaveBeenCalled();
      });
    });

    describe('when called with no projectId and there are tasks in the repository', () => {
      it('sends back all tasks in the repository', async () => {
        const allTasks: Task[] = [
          {
            id: 'task-1',
            title: 'Task 1',
            description: 'Description 1',
            projectId: 'project-1',
            createdAt: new Date(),
            lastModifiedAt: new Date(),
          },
          {
            id: 'task-2',
            title: 'Task 2',
            description: 'Description 2',
            projectId: 'project-2',
            createdAt: new Date(),
            lastModifiedAt: new Date(),
          },
        ];

        mockRequest.query = {};
        mockTaskRepository.findAll.mockResolvedValue(allTasks);

        await taskController.list(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.findAll).toHaveBeenCalled();
        expect(mockTaskRepository.findByProjectId).not.toHaveBeenCalled();
        expect(responseJson).toHaveBeenCalledWith(allTasks);
        expect(responseStatus).not.toHaveBeenCalled();
      });
    });

    describe('when called with a projectId not matching any project in the repository', () => {
      it('sends back an empty array', async () => {
        const projectId = 'non-existent-project';
        
        mockRequest.query = { projectId };
        mockTaskRepository.findByProjectId.mockResolvedValue([]);

        await taskController.list(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.findByProjectId).toHaveBeenCalledWith(projectId);
        expect(mockTaskRepository.findAll).not.toHaveBeenCalled();
        expect(responseJson).toHaveBeenCalledWith([]);
        expect(responseStatus).not.toHaveBeenCalled();
      });
    });

    describe('when called with a projectId matching a project that has no tasks in the repository', () => {
      it('sends back an empty array', async () => {
        const projectId = 'project-with-no-tasks';
        
        mockRequest.query = { projectId };
        mockTaskRepository.findByProjectId.mockResolvedValue([]);

        await taskController.list(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.findByProjectId).toHaveBeenCalledWith(projectId);
        expect(mockTaskRepository.findAll).not.toHaveBeenCalled();
        expect(responseJson).toHaveBeenCalledWith([]);
        expect(responseStatus).not.toHaveBeenCalled();
      });
    });

    describe('when called with a projectId matching a project with tasks in the repository', () => {
      it('only sends back those tasks and not ones matching other projects', async () => {
        const projectId = 'project-1';
        const projectTasks: Task[] = [
          {
            id: 'task-1',
            title: 'Task 1',
            description: 'Description 1',
            projectId: 'project-1',
            createdAt: new Date(),
            lastModifiedAt: new Date(),
          },
          {
            id: 'task-2',
            title: 'Task 2',
            description: 'Description 2',
            projectId: 'project-1',
            createdAt: new Date(),
            lastModifiedAt: new Date(),
          },
        ];

        mockRequest.query = { projectId };
        mockTaskRepository.findByProjectId.mockResolvedValue(projectTasks);

        await taskController.list(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.findByProjectId).toHaveBeenCalledWith(projectId);
        expect(mockTaskRepository.findAll).not.toHaveBeenCalled();
        expect(responseJson).toHaveBeenCalledWith(projectTasks);
        
        // Verify that all returned tasks belong to the requested project
        const returnedTasks = responseJson.mock.calls[0][0] as Task[];
        returnedTasks.forEach(task => {
          expect(task.projectId).toBe(projectId);
        });
        
        expect(responseStatus).not.toHaveBeenCalled();
      });
    });
  });

  describe('update', () => {
    describe('when called with an id not matching an existing task', () => {
      it('sends back a 404 response code', async () => {
        const taskId = 'non-existent-task';
        const updateData = {
          title: 'Updated Title',
        };

        mockRequest.params = { id: taskId };
        mockRequest.body = updateData;
        mockTaskRepository.findById.mockResolvedValue(null);
        mockTaskRepository.update.mockResolvedValue(null);

        await taskController.update(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.update).toHaveBeenCalled();
        expect(responseStatus).toHaveBeenCalledWith(404);
        expect(responseJson).toHaveBeenCalledWith({ error: 'Task not found' });
      });
    });

    describe('when called with an invalid id param', () => {
      it('sends back a 400 response code when id is empty string', async () => {
        const taskId = '';
        const updateData = {
          title: 'Updated Title',
        };

        mockRequest.params = { id: taskId };
        mockRequest.body = updateData;

        await taskController.update(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.update).not.toHaveBeenCalled();
        expect(responseStatus).toHaveBeenCalledWith(400);
        expect(responseJson).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Failed to update task',
          })
        );
      });
    });

    describe('when called with a task found and single field updated', () => {
      it('saves the updated task to the repository and returns 200', async () => {
        const taskId = 'task-123';
        const existingTask: Task = {
          id: taskId,
          title: 'Original Title',
          description: 'Original Description',
          projectId: 'project-123',
          createdAt: new Date(),
          lastModifiedAt: new Date(),
        };

        const updateData = {
          title: 'Updated Title',
        };

        const updatedTask: Task = {
          ...existingTask,
          title: 'Updated Title',
          lastModifiedAt: new Date(),
        };

        mockRequest.params = { id: taskId };
        mockRequest.body = updateData;
        mockTaskRepository.update.mockResolvedValue(updatedTask);

        await taskController.update(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, updateData);
        expect(responseJson).toHaveBeenCalledWith(updatedTask);
        expect(responseStatus).not.toHaveBeenCalled();
      });
    });

    describe('when called with a task found and all fields updated', () => {
      it('saves all updated fields to the repository and returns 200', async () => {
        const taskId = 'task-123';
        const existingTask: Task = {
          id: taskId,
          title: 'Original Title',
          description: 'Original Description',
          projectId: 'project-123',
          createdAt: new Date(),
          lastModifiedAt: new Date(),
        };

        const updateData = {
          title: 'Updated Title',
          description: 'Updated Description',
          status: 'in-progress',
          estimate: 5,
          assigneeId: 'user-456',
        };

        const expectedUpdateData = {
          ...updateData,
          estimate: updateData.estimate,
          assigneeId: updateData.assigneeId,
        };

        const updatedTask: Task = {
          ...existingTask,
          ...updateData,
          lastModifiedAt: new Date(),
        };

        mockRequest.params = { id: taskId };
        mockRequest.body = updateData;
        mockTaskRepository.update.mockResolvedValue(updatedTask);

        await taskController.update(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, expectedUpdateData);
        expect(responseJson).toHaveBeenCalledWith(updatedTask);
        expect(responseStatus).not.toHaveBeenCalled();
      });
    });

    describe('when called with valid inputs', () => {
      it('updates only title', async () => {
        const taskId = 'task-123';
        const updateData = { title: 'New Title' };
        const updatedTask: Task = {
          id: taskId,
          title: 'New Title',
          description: 'Description',
          projectId: 'project-123',
          createdAt: new Date(),
          lastModifiedAt: new Date(),
        };

        mockRequest.params = { id: taskId };
        mockRequest.body = updateData;
        mockTaskRepository.update.mockResolvedValue(updatedTask);

        await taskController.update(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, updateData);
        expect(responseJson).toHaveBeenCalledWith(updatedTask);
      });

      it('updates only description', async () => {
        const taskId = 'task-123';
        const updateData = { description: 'New Description' };
        const updatedTask: Task = {
          id: taskId,
          title: 'Title',
          description: 'New Description',
          projectId: 'project-123',
          createdAt: new Date(),
          lastModifiedAt: new Date(),
        };

        mockRequest.params = { id: taskId };
        mockRequest.body = updateData;
        mockTaskRepository.update.mockResolvedValue(updatedTask);

        await taskController.update(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, updateData);
        expect(responseJson).toHaveBeenCalledWith(updatedTask);
      });

      it('updates only status', async () => {
        const taskId = 'task-123';
        const updateData = { status: 'completed' };
        const updatedTask: Task = {
          id: taskId,
          title: 'Title',
          description: 'Description',
          status: 'completed',
          projectId: 'project-123',
          createdAt: new Date(),
          lastModifiedAt: new Date(),
        };

        mockRequest.params = { id: taskId };
        mockRequest.body = updateData;
        mockTaskRepository.update.mockResolvedValue(updatedTask);

        await taskController.update(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, updateData);
        expect(responseJson).toHaveBeenCalledWith(updatedTask);
      });

      it('updates only estimate', async () => {
        const taskId = 'task-123';
        const updateData = { estimate: 8 };
        const updatedTask: Task = {
          id: taskId,
          title: 'Title',
          description: 'Description',
          estimate: 8,
          projectId: 'project-123',
          createdAt: new Date(),
          lastModifiedAt: new Date(),
        };

        mockRequest.params = { id: taskId };
        mockRequest.body = updateData;
        mockTaskRepository.update.mockResolvedValue(updatedTask);

        await taskController.update(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, updateData);
        expect(responseJson).toHaveBeenCalledWith(updatedTask);
      });

      it('updates only assigneeId', async () => {
        const taskId = 'task-123';
        const updateData = { assigneeId: 'user-789' };
        const updatedTask: Task = {
          id: taskId,
          title: 'Title',
          description: 'Description',
          assigneeId: 'user-789',
          projectId: 'project-123',
          createdAt: new Date(),
          lastModifiedAt: new Date(),
        };

        mockRequest.params = { id: taskId };
        mockRequest.body = updateData;
        mockTaskRepository.update.mockResolvedValue(updatedTask);

        await taskController.update(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, updateData);
        expect(responseJson).toHaveBeenCalledWith(updatedTask);
      });

      it('updates estimate to null and converts to undefined', async () => {
        const taskId = 'task-123';
        const updateData = { estimate: null };
        const updatedTask: Task = {
          id: taskId,
          title: 'Title',
          description: 'Description',
          projectId: 'project-123',
          createdAt: new Date(),
          lastModifiedAt: new Date(),
        };

        mockRequest.params = { id: taskId };
        mockRequest.body = updateData;
        mockTaskRepository.update.mockResolvedValue(updatedTask);

        await taskController.update(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, { estimate: undefined });
        expect(responseJson).toHaveBeenCalledWith(updatedTask);
      });

      it('updates assigneeId to null and converts to undefined', async () => {
        const taskId = 'task-123';
        const updateData = { assigneeId: null };
        const updatedTask: Task = {
          id: taskId,
          title: 'Title',
          description: 'Description',
          projectId: 'project-123',
          createdAt: new Date(),
          lastModifiedAt: new Date(),
        };

        mockRequest.params = { id: taskId };
        mockRequest.body = updateData;
        mockTaskRepository.update.mockResolvedValue(updatedTask);

        await taskController.update(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, { assigneeId: undefined });
        expect(responseJson).toHaveBeenCalledWith(updatedTask);
      });

      it('updates multiple fields at once', async () => {
        const taskId = 'task-123';
        const updateData = {
          title: 'New Title',
          description: 'New Description',
          status: 'in-progress',
        };
        const updatedTask: Task = {
          id: taskId,
          title: 'New Title',
          description: 'New Description',
          status: 'in-progress',
          projectId: 'project-123',
          createdAt: new Date(),
          lastModifiedAt: new Date(),
        };

        mockRequest.params = { id: taskId };
        mockRequest.body = updateData;
        mockTaskRepository.update.mockResolvedValue(updatedTask);

        await taskController.update(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, updateData);
        expect(responseJson).toHaveBeenCalledWith(updatedTask);
      });

      it('does not save extraneous fields to the repository', async () => {
        const taskId = 'task-123';
        const updateDataWithExtraneous = {
          title: 'Updated Title',
          extraneousField: 'should not be saved',
          anotherExtraField: 12345,
        };
        const updatedTask: Task = {
          id: taskId,
          title: 'Updated Title',
          description: 'Description',
          projectId: 'project-123',
          createdAt: new Date(),
          lastModifiedAt: new Date(),
        };

        mockRequest.params = { id: taskId };
        mockRequest.body = updateDataWithExtraneous;
        mockTaskRepository.update.mockResolvedValue(updatedTask);

        await taskController.update(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.update).toHaveBeenCalled();
        const updateCallArgs = mockTaskRepository.update.mock.calls[0][1];
        expect(updateCallArgs).not.toHaveProperty('extraneousField');
        expect(updateCallArgs).not.toHaveProperty('anotherExtraField');
        expect(updateCallArgs).toHaveProperty('title');
        expect(responseJson).toHaveBeenCalledWith(updatedTask);
      });
    });

    describe('when called with invalid inputs', () => {
      it('returns 400 when title is empty string', async () => {
        const taskId = 'task-123';
        const updateData = {
          title: '',
        };

        mockRequest.params = { id: taskId };
        mockRequest.body = updateData;

        await taskController.update(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.update).not.toHaveBeenCalled();
        expect(responseStatus).toHaveBeenCalledWith(400);
        expect(responseJson).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Failed to update task',
          })
        );
      });

      it('returns 400 when estimate is negative', async () => {
        const taskId = 'task-123';
        const updateData = {
          estimate: -1,
        };

        mockRequest.params = { id: taskId };
        mockRequest.body = updateData;

        await taskController.update(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.update).not.toHaveBeenCalled();
        expect(responseStatus).toHaveBeenCalledWith(400);
        expect(responseJson).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Failed to update task',
          })
        );
      });
    });
  });

  describe('delete', () => {
    describe('when called with an id not matching an existing task', () => {
      it('sends back a 404 response code', async () => {
        const taskId = 'non-existent-task';

        mockRequest.params = { id: taskId };
        mockTaskRepository.delete.mockResolvedValue(false);

        await taskController.delete(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.delete).toHaveBeenCalledWith(taskId);
        expect(responseStatus).toHaveBeenCalledWith(404);
        expect(responseJson).toHaveBeenCalledWith({ error: 'Task not found' });
      });
    });

    describe('when called with an invalid id param', () => {
      it('sends back a 400 response code when id is empty string', async () => {
        const taskId = '';

        mockRequest.params = { id: taskId };

        await taskController.delete(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.delete).not.toHaveBeenCalled();
        expect(responseStatus).toHaveBeenCalledWith(400);
        expect(responseJson).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Failed to delete task',
          })
        );
      });
    });

    describe('when called with a task found and deleted', () => {
      it('sends back a 204 response code with no body', async () => {
        const taskId = 'task-123';

        mockRequest.params = { id: taskId };
        mockTaskRepository.delete.mockResolvedValue(true);

        await taskController.delete(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.delete).toHaveBeenCalledWith(taskId);
        expect(responseStatus).toHaveBeenCalledWith(204);
        expect(mockResponse.send).toHaveBeenCalled();
        expect(responseJson).not.toHaveBeenCalled();
      });
    });
  });

  describe('linkTasks', () => {
    describe('when called with from task not found', () => {
      it('sends back a 404 response code with "From task not found"', async () => {
        const fromTaskId = 'non-existent-from-task';
        const linkData = {
          toTaskId: 'task-123',
          descriptor: 'blocks',
        };

        mockRequest.params = { id: fromTaskId };
        mockRequest.body = linkData;
        mockTaskRepository.findById.mockResolvedValue(null);

        await taskController.linkTasks(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.findById).toHaveBeenCalledWith(fromTaskId);
        expect(mockTaskLinkRepository.create).not.toHaveBeenCalled();
        expect(responseStatus).toHaveBeenCalledWith(404);
        expect(responseJson).toHaveBeenCalledWith({ error: 'From task not found' });
      });
    });

    describe('when called with to task not found', () => {
      it('sends back a 404 response code with "To task not found"', async () => {
        const fromTaskId = 'task-123';
        const toTaskId = 'non-existent-to-task';
        const linkData = {
          toTaskId,
          descriptor: 'blocks',
        };

        const fromTask: Task = {
          id: fromTaskId,
          title: 'From Task',
          description: 'Description',
          projectId: 'project-123',
          createdAt: new Date(),
          lastModifiedAt: new Date(),
        };

        mockRequest.params = { id: fromTaskId };
        mockRequest.body = linkData;
        mockTaskRepository.findById
          .mockResolvedValueOnce(fromTask)
          .mockResolvedValueOnce(null);

        await taskController.linkTasks(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.findById).toHaveBeenCalledWith(fromTaskId);
        expect(mockTaskRepository.findById).toHaveBeenCalledWith(toTaskId);
        expect(mockTaskLinkRepository.create).not.toHaveBeenCalled();
        expect(responseStatus).toHaveBeenCalledWith(404);
        expect(responseJson).toHaveBeenCalledWith({ error: 'To task not found' });
      });
    });

    describe('when called with missing toTaskId in body', () => {
      it('sends back a 400 response code', async () => {
        const fromTaskId = 'task-123';
        const linkData = {
          descriptor: 'blocks',
        };

        mockRequest.params = { id: fromTaskId };
        mockRequest.body = linkData;

        await taskController.linkTasks(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.findById).not.toHaveBeenCalled();
        expect(mockTaskLinkRepository.create).not.toHaveBeenCalled();
        expect(responseStatus).toHaveBeenCalledWith(400);
        expect(responseJson).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Failed to link tasks',
          })
        );
      });
    });

    describe('when called with missing descriptor in body', () => {
      it('sends back a 400 response code', async () => {
        const fromTaskId = 'task-123';
        const linkData = {
          toTaskId: 'task-456',
        };

        mockRequest.params = { id: fromTaskId };
        mockRequest.body = linkData;

        await taskController.linkTasks(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.findById).not.toHaveBeenCalled();
        expect(mockTaskLinkRepository.create).not.toHaveBeenCalled();
        expect(responseStatus).toHaveBeenCalledWith(400);
        expect(responseJson).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Failed to link tasks',
          })
        );
      });
    });

    describe('when called with both tasks found and link created', () => {
      it('sends back a 201 response code with created link', async () => {
        const fromTaskId = 'task-123';
        const toTaskId = 'task-456';
        const linkData = {
          toTaskId,
          descriptor: 'blocks',
        };

        const fromTask: Task = {
          id: fromTaskId,
          title: 'From Task',
          description: 'Description',
          projectId: 'project-123',
          createdAt: new Date(),
          lastModifiedAt: new Date(),
        };

        const toTask: Task = {
          id: toTaskId,
          title: 'To Task',
          description: 'Description',
          projectId: 'project-123',
          createdAt: new Date(),
          lastModifiedAt: new Date(),
        };

        const createdLink: TaskLink = {
          id: 'link-123',
          fromTaskId,
          toTaskId,
          descriptor: 'blocks',
          createdAt: new Date(),
        };

        mockRequest.params = { id: fromTaskId };
        mockRequest.body = linkData;
        mockTaskRepository.findById
          .mockResolvedValueOnce(fromTask)
          .mockResolvedValueOnce(toTask);
        mockTaskLinkRepository.create.mockResolvedValue(createdLink);

        await taskController.linkTasks(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.findById).toHaveBeenCalledWith(fromTaskId);
        expect(mockTaskRepository.findById).toHaveBeenCalledWith(toTaskId);
        expect(mockTaskLinkRepository.create).toHaveBeenCalledWith({
          fromTaskId,
          toTaskId,
          descriptor: 'blocks',
        });
        expect(responseStatus).toHaveBeenCalledWith(201);
        expect(responseJson).toHaveBeenCalledWith(createdLink);
      });
    });

    describe('when called with invalid inputs', () => {
      it('returns 400 when fromTaskId is empty string', async () => {
        const fromTaskId = '';
        const linkData = {
          toTaskId: 'task-456',
          descriptor: 'blocks',
        };

        mockRequest.params = { id: fromTaskId };
        mockRequest.body = linkData;

        await taskController.linkTasks(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.findById).not.toHaveBeenCalled();
        expect(mockTaskLinkRepository.create).not.toHaveBeenCalled();
        expect(responseStatus).toHaveBeenCalledWith(400);
        expect(responseJson).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Failed to link tasks',
          })
        );
      });

      it('returns 400 when toTaskId is empty string', async () => {
        const fromTaskId = 'task-123';
        const linkData = {
          toTaskId: '',
          descriptor: 'blocks',
        };

        mockRequest.params = { id: fromTaskId };
        mockRequest.body = linkData;

        await taskController.linkTasks(mockRequest as Request, mockResponse as Response);

        expect(mockTaskRepository.findById).not.toHaveBeenCalled();
        expect(mockTaskLinkRepository.create).not.toHaveBeenCalled();
        expect(responseStatus).toHaveBeenCalledWith(400);
        expect(responseJson).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Failed to link tasks',
          })
        );
      });

      it('does not save extraneous fields to the repository', async () => {
        const fromTaskId = 'task-123';
        const toTaskId = 'task-456';
        const linkDataWithExtraneous = {
          toTaskId,
          descriptor: 'blocks',
          extraneousField: 'should not be saved',
          anotherExtraField: 12345,
        };

        const fromTask: Task = {
          id: fromTaskId,
          title: 'From Task',
          description: 'Description',
          projectId: 'project-123',
          createdAt: new Date(),
          lastModifiedAt: new Date(),
        };

        const toTask: Task = {
          id: toTaskId,
          title: 'To Task',
          description: 'Description',
          projectId: 'project-123',
          createdAt: new Date(),
          lastModifiedAt: new Date(),
        };

        const createdLink: TaskLink = {
          id: 'link-123',
          fromTaskId,
          toTaskId,
          descriptor: 'blocks',
          createdAt: new Date(),
        };

        mockRequest.params = { id: fromTaskId };
        mockRequest.body = linkDataWithExtraneous;
        mockTaskRepository.findById
          .mockResolvedValueOnce(fromTask)
          .mockResolvedValueOnce(toTask);
        mockTaskLinkRepository.create.mockResolvedValue(createdLink);

        await taskController.linkTasks(mockRequest as Request, mockResponse as Response);

        expect(mockTaskLinkRepository.create).toHaveBeenCalled();
        const createCallArgs = mockTaskLinkRepository.create.mock.calls[0][0];
        expect(createCallArgs).not.toHaveProperty('extraneousField');
        expect(createCallArgs).not.toHaveProperty('anotherExtraField');
        expect(createCallArgs).toHaveProperty('fromTaskId');
        expect(createCallArgs).toHaveProperty('toTaskId');
        expect(createCallArgs).toHaveProperty('descriptor');
        expect(responseStatus).toHaveBeenCalledWith(201);
        expect(responseJson).toHaveBeenCalledWith(createdLink);
      });
    });
  });

  describe('getTaskLinks', () => {
    describe('when called with no links found', () => {
      it('sends back an empty array', async () => {
        const taskId = 'task-123';

        mockRequest.params = { id: taskId };
        mockTaskLinkRepository.findByTaskId.mockResolvedValue([]);

        await taskController.getTaskLinks(mockRequest as Request, mockResponse as Response);

        expect(mockTaskLinkRepository.findByTaskId).toHaveBeenCalledWith(taskId);
        expect(responseJson).toHaveBeenCalledWith([]);
        expect(responseStatus).not.toHaveBeenCalled();
      });
    });

    describe('when called with an invalid id param', () => {
      it('sends back a 400 response code when id is empty string', async () => {
        const taskId = '';

        mockRequest.params = { id: taskId };

        await taskController.getTaskLinks(mockRequest as Request, mockResponse as Response);

        expect(mockTaskLinkRepository.findByTaskId).not.toHaveBeenCalled();
        expect(responseStatus).toHaveBeenCalledWith(400);
        expect(responseJson).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Invalid request',
          })
        );
      });
    });

    describe('when called with one link found', () => {
      it('sends back an array with one link', async () => {
        const taskId = 'task-123';
        const link: TaskLink = {
          id: 'link-123',
          fromTaskId: taskId,
          toTaskId: 'task-456',
          descriptor: 'blocks',
          createdAt: new Date(),
        };

        mockRequest.params = { id: taskId };
        mockTaskLinkRepository.findByTaskId.mockResolvedValue([link]);

        await taskController.getTaskLinks(mockRequest as Request, mockResponse as Response);

        expect(mockTaskLinkRepository.findByTaskId).toHaveBeenCalledWith(taskId);
        expect(responseJson).toHaveBeenCalledWith([link]);
        expect(responseStatus).not.toHaveBeenCalled();
      });
    });

    describe('when called with multiple links found', () => {
      it('sends back an array with all links', async () => {
        const taskId = 'task-123';
        const links: TaskLink[] = [
          {
            id: 'link-1',
            fromTaskId: taskId,
            toTaskId: 'task-456',
            descriptor: 'blocks',
            createdAt: new Date(),
          },
          {
            id: 'link-2',
            fromTaskId: taskId,
            toTaskId: 'task-789',
            descriptor: 'relates to',
            createdAt: new Date(),
          },
          {
            id: 'link-3',
            fromTaskId: 'task-999',
            toTaskId: taskId,
            descriptor: 'blocks',
            createdAt: new Date(),
          },
        ];

        mockRequest.params = { id: taskId };
        mockTaskLinkRepository.findByTaskId.mockResolvedValue(links);

        await taskController.getTaskLinks(mockRequest as Request, mockResponse as Response);

        expect(mockTaskLinkRepository.findByTaskId).toHaveBeenCalledWith(taskId);
        expect(responseJson).toHaveBeenCalledWith(links);
        expect(responseStatus).not.toHaveBeenCalled();
      });
    });
  });
});
