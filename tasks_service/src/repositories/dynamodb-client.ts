import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined, // Will use IAM role if running on EC2
});

export const dynamoDBDocumentClient = DynamoDBDocumentClient.from(client);

// Table names from environment or defaults
export const TASKS_TABLE = process.env.TASKS_TABLE || 'cloud-project-manager-test-tasks';
export const TASK_LINKS_TABLE = process.env.TASK_LINKS_TABLE || 'cloud-project-manager-test-task-links';
export const COMMENTS_TABLE = process.env.COMMENTS_TABLE || 'cloud-project-manager-test-comments';
