import { QueryCommand, PutCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { Task } from '../types/entities';
import { ITaskRepository, PaginatedResult, PaginationOptions } from './interfaces';
import { dynamoDBDocumentClient, TASKS_TABLE } from './dynamodb-client';
import { encodePageToken, normalizePaginationOptions } from './pagination-utils';

export class DynamoDBTaskRepository implements ITaskRepository {
  async create(task: Omit<Task, 'id' | 'createdAt' | 'lastModifiedAt'>): Promise<Task> {
    const id = uuidv4();
    const now = new Date();
    const newTask: Task = {
      ...task,
      status: task.status || 'Open',
      id,
      createdAt: now,
      lastModifiedAt: now,
    };

    await dynamoDBDocumentClient.send(
      new PutCommand({
        TableName: TASKS_TABLE,
        Item: {
          id: newTask.id,
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          estimate: newTask.estimate,
          projectId: newTask.projectId,
          assigneeId: newTask.assigneeId,
          createdAt: newTask.createdAt.toISOString(),
          lastModifiedAt: newTask.lastModifiedAt.toISOString(),
        },
      })
    );

    return newTask;
  }

  async findById(id: string): Promise<Task | null> {
    const result = await dynamoDBDocumentClient.send(
      new GetCommand({
        TableName: TASKS_TABLE,
        Key: { id },
      })
    );

    if (!result.Item) {
      return null;
    }

    return this.mapToTask(result.Item);
  }

  async findByProjectId(projectId: string, options?: PaginationOptions): Promise<PaginatedResult<Task>> {
    const { limit, exclusiveStartKey } = normalizePaginationOptions(options);

    const result = await dynamoDBDocumentClient.send(
      new QueryCommand({
        TableName: TASKS_TABLE,
        IndexName: 'ProjectIndex',
        KeyConditionExpression: 'projectId = :projectId',
        ExpressionAttributeValues: {
          ':projectId': projectId,
        },
        Limit: limit,
        ExclusiveStartKey: exclusiveStartKey,
      })
    );

    const items = (result.Items || []).map(item => this.mapToTask(item));
    const nextPageToken = encodePageToken(result.LastEvaluatedKey);

    return {
      items,
      nextPageToken,
    };
  }

  async update(
    id: string,
    updates: Partial<Omit<Task, 'id' | 'createdAt' | 'projectId' | 'lastModifiedAt'>>
  ): Promise<Task | null> {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (updates.title !== undefined) {
      updateExpressions.push('#title = :title');
      expressionAttributeNames['#title'] = 'title';
      expressionAttributeValues[':title'] = updates.title;
    }

    if (updates.description !== undefined) {
      updateExpressions.push('#description = :description');
      expressionAttributeNames['#description'] = 'description';
      expressionAttributeValues[':description'] = updates.description;
    }

    if (updates.status !== undefined) {
      updateExpressions.push('#status = :status');
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = updates.status;
    }

    if (updates.estimate !== undefined) {
      updateExpressions.push('#estimate = :estimate');
      expressionAttributeNames['#estimate'] = 'estimate';
      expressionAttributeValues[':estimate'] = updates.estimate;
    }

    if (updates.assigneeId !== undefined) {
      updateExpressions.push('#assigneeId = :assigneeId');
      expressionAttributeNames['#assigneeId'] = 'assigneeId';
      expressionAttributeValues[':assigneeId'] = updates.assigneeId;
    }

    // Always update lastModifiedAt
    updateExpressions.push('#lastModifiedAt = :lastModifiedAt');
    expressionAttributeNames['#lastModifiedAt'] = 'lastModifiedAt';
    expressionAttributeValues[':lastModifiedAt'] = new Date().toISOString();

    if (updateExpressions.length === 0) {
      // No updates to apply, just return the existing task
      return this.findById(id);
    }

    const result = await dynamoDBDocumentClient.send(
      new UpdateCommand({
        TableName: TASKS_TABLE,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    );

    if (!result.Attributes) {
      return null;
    }

    return this.mapToTask(result.Attributes);
  }

  async delete(id: string): Promise<boolean> {
    const result = await dynamoDBDocumentClient.send(
      new DeleteCommand({
        TableName: TASKS_TABLE,
        Key: { id },
        ReturnValues: 'ALL_OLD',
      })
    );

    return !!result.Attributes;
  }

  private mapToTask(item: Record<string, any>): Task {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status,
      estimate: item.estimate,
      projectId: item.projectId,
      assigneeId: item.assigneeId,
      createdAt: new Date(item.createdAt),
      lastModifiedAt: new Date(item.lastModifiedAt),
    };
  }
}
