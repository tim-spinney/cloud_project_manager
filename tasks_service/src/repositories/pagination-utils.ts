import { PaginationOptions } from './interfaces';

/**
 * Encodes DynamoDB LastEvaluatedKey to a base64 string for use as a page token
 */
export function encodePageToken(key: Record<string, any> | undefined): string | undefined {
  if (!key) return undefined;
  return Buffer.from(JSON.stringify(key)).toString('base64');
}

/**
 * Decodes a base64 page token back to DynamoDB ExclusiveStartKey format
 */
export function decodePageToken(token: string | undefined): Record<string, any> | undefined {
  if (!token) return undefined;
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
  } catch {
    return undefined;
  }
}

/**
 * Validates and normalizes pagination options
 */
export function normalizePaginationOptions(options?: PaginationOptions): { limit: number; exclusiveStartKey?: Record<string, any> } {
  const limit = Math.min(Math.max(options?.limit || 20, 1), 100);
  const exclusiveStartKey = decodePageToken(options?.pageToken);
  
  return {
    limit,
    exclusiveStartKey,
  };
}
