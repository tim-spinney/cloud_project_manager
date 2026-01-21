import { QueryCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { Comment } from '../types/entities';
import { ICommentRepository, PaginatedResult, PaginationOptions } from './interfaces';
import { dynamoDBDocumentClient, COMMENTS_TABLE } from './dynamodb-client';
import { encodePageToken, normalizePaginationOptions } from './pagination-utils';

export class DynamoDBCommentRepository implements ICommentRepository {
  async create(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    const id = uuidv4();
    const newComment: Comment = {
      ...comment,
      id,
      createdAt: new Date(),
    };

    await dynamoDBDocumentClient.send(
      new PutCommand({
        TableName: COMMENTS_TABLE,
        Item: {
          id: newComment.id,
          taskId: newComment.taskId,
          authorId: newComment.authorId,
          text: newComment.text,
          createdAt: newComment.createdAt.toISOString(),
        },
      })
    );

    return newComment;
  }

  async findByTaskId(taskId: string, options?: PaginationOptions): Promise<PaginatedResult<Comment>> {
    const { limit, exclusiveStartKey } = normalizePaginationOptions(options);

    const result = await dynamoDBDocumentClient.send(
      new QueryCommand({
        TableName: COMMENTS_TABLE,
        IndexName: 'TaskCommentsIndex',
        KeyConditionExpression: 'taskId = :taskId',
        ExpressionAttributeValues: {
          ':taskId': taskId,
        },
        ScanIndexForward: true, // Sort by createdAt ascending
        Limit: limit,
        ExclusiveStartKey: exclusiveStartKey,
      })
    );

    const items = (result.Items || []).map(item => this.mapToComment(item));
    const nextPageToken = encodePageToken(result.LastEvaluatedKey);

    return {
      items,
      nextPageToken,
    };
  }

  async delete(id: string): Promise<boolean> {
    const result = await dynamoDBDocumentClient.send(
      new DeleteCommand({
        TableName: COMMENTS_TABLE,
        Key: { id },
        ReturnValues: 'ALL_OLD',
      })
    );

    return !!result.Attributes;
  }

  private mapToComment(item: Record<string, any>): Comment {
    return {
      id: item.id,
      taskId: item.taskId,
      authorId: item.authorId,
      text: item.text,
      createdAt: new Date(item.createdAt),
    };
  }
}
