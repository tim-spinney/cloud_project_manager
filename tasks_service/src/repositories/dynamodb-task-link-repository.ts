import { QueryCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { TaskLink } from '../types/entities';
import { ITaskLinkRepository, PaginatedResult, PaginationOptions } from './interfaces';
import { dynamoDBDocumentClient, TASK_LINKS_TABLE } from './dynamodb-client';
import { encodePageToken, normalizePaginationOptions } from './pagination-utils';

export class DynamoDBTaskLinkRepository implements ITaskLinkRepository {
  async create(link: Omit<TaskLink, 'id' | 'createdAt'>): Promise<TaskLink> {
    const id = uuidv4();
    const newLink: TaskLink = {
      ...link,
      id,
      createdAt: new Date(),
    };

    await dynamoDBDocumentClient.send(
      new PutCommand({
        TableName: TASK_LINKS_TABLE,
        Item: {
          id: newLink.id,
          fromTaskId: newLink.fromTaskId,
          toTaskId: newLink.toTaskId,
          descriptor: newLink.descriptor,
          createdAt: newLink.createdAt.toISOString(),
        },
      })
    );

    return newLink;
  }

  async findByTaskId(taskId: string, options?: PaginationOptions): Promise<PaginatedResult<TaskLink>> {
    // Query both fromTaskId and toTaskId, then merge results
    // Note: This merges two paginated queries, so pagination may not be perfect across the combined set
    const [fromResult, toResult] = await Promise.all([
      this.findByFromTaskId(taskId, options),
      this.findByToTaskId(taskId, options),
    ]);

    // Merge and deduplicate by id
    const linkMap = new Map<string, TaskLink>();
    [...fromResult.items, ...toResult.items].forEach(link => {
      linkMap.set(link.id, link);
    });

    const items = Array.from(linkMap.values());
    // Use the nextPageToken from either result if available (prioritize fromTaskId)
    const nextPageToken = fromResult.nextPageToken || toResult.nextPageToken;

    return {
      items,
      nextPageToken,
    };
  }

  async findByFromTaskId(fromTaskId: string, options?: PaginationOptions): Promise<PaginatedResult<TaskLink>> {
    const { limit, exclusiveStartKey } = normalizePaginationOptions(options);

    const result = await dynamoDBDocumentClient.send(
      new QueryCommand({
        TableName: TASK_LINKS_TABLE,
        IndexName: 'FromTaskIndex',
        KeyConditionExpression: 'fromTaskId = :fromTaskId',
        ExpressionAttributeValues: {
          ':fromTaskId': fromTaskId,
        },
        Limit: limit,
        ExclusiveStartKey: exclusiveStartKey,
      })
    );

    const items = (result.Items || []).map(item => this.mapToTaskLink(item));
    const nextPageToken = encodePageToken(result.LastEvaluatedKey);

    return {
      items,
      nextPageToken,
    };
  }

  async findByToTaskId(toTaskId: string, options?: PaginationOptions): Promise<PaginatedResult<TaskLink>> {
    const { limit, exclusiveStartKey } = normalizePaginationOptions(options);

    const result = await dynamoDBDocumentClient.send(
      new QueryCommand({
        TableName: TASK_LINKS_TABLE,
        IndexName: 'ToTaskIndex',
        KeyConditionExpression: 'toTaskId = :toTaskId',
        ExpressionAttributeValues: {
          ':toTaskId': toTaskId,
        },
        Limit: limit,
        ExclusiveStartKey: exclusiveStartKey,
      })
    );

    const items = (result.Items || []).map(item => this.mapToTaskLink(item));
    const nextPageToken = encodePageToken(result.LastEvaluatedKey);

    return {
      items,
      nextPageToken,
    };
  }

  async delete(id: string): Promise<boolean> {
    const result = await dynamoDBDocumentClient.send(
      new DeleteCommand({
        TableName: TASK_LINKS_TABLE,
        Key: { id },
        ReturnValues: 'ALL_OLD',
      })
    );

    return !!result.Attributes;
  }

  private mapToTaskLink(item: Record<string, any>): TaskLink {
    return {
      id: item.id,
      fromTaskId: item.fromTaskId,
      toTaskId: item.toTaskId,
      descriptor: item.descriptor,
      createdAt: new Date(item.createdAt),
    };
  }
}
