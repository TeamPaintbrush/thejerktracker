import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand
} from '@aws-sdk/lib-dynamodb'

// Configuration for local development vs AWS
const isDevelopment = process.env.NODE_ENV !== 'production'

const dynamoClient = new DynamoDBClient({
  region: isDevelopment ? 'localhost' : process.env.AWS_REGION || 'us-east-1',
  endpoint: isDevelopment ? 'http://localhost:8000' : undefined,
  credentials: isDevelopment ? {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy'
  } : undefined
})

export const docClient = DynamoDBDocumentClient.from(dynamoClient)

// Table names
export const TABLES = {
  USERS: process.env.USERS_TABLE || 'thejerktracker-users',
  ORDERS: process.env.ORDERS_TABLE || 'thejerktracker-orders',
  RESTAURANTS: process.env.RESTAURANTS_TABLE || 'thejerktracker-restaurants'
}

// Helper functions for common operations
export class DynamoDBService {
  // Generic CRUD operations
  static async create(tableName: string, item: Record<string, unknown>) {
    const command = new PutCommand({
      TableName: tableName,
      Item: {
        ...item,
        id: item.id || crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    })
    
    await docClient.send(command)
    return item
  }

  static async getById(tableName: string, id: string) {
    const command = new GetCommand({
      TableName: tableName,
      Key: { id }
    })
    
    const result = await docClient.send(command)
    return result.Item
  }

  static async getAll(tableName: string) {
    const command = new ScanCommand({
      TableName: tableName
    })
    
    const result = await docClient.send(command)
    return result.Items || []
  }

  static async update(tableName: string, id: string, updates: Record<string, unknown>) {
    const updateExpression = Object.keys(updates)
      .map(key => `#${key} = :${key}`)
      .join(', ')
    
    const expressionAttributeNames = Object.keys(updates)
      .reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {})
    
    const expressionAttributeValues = Object.keys(updates)
      .reduce((acc, key) => ({ ...acc, [`:${key}`]: updates[key] }), {})

    const command = new UpdateCommand({
      TableName: tableName,
      Key: { id },
      UpdateExpression: `SET ${updateExpression}, #updatedAt = :updatedAt`,
      ExpressionAttributeNames: {
        ...expressionAttributeNames,
        '#updatedAt': 'updatedAt'
      },
      ExpressionAttributeValues: {
        ...expressionAttributeValues,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    })
    
    const result = await docClient.send(command)
    return result.Attributes
  }

  static async delete(tableName: string, id: string) {
    const command = new DeleteCommand({
      TableName: tableName,
      Key: { id }
    })
    
    await docClient.send(command)
  }

  static async query(tableName: string, keyCondition: { expression: string; values: Record<string, unknown> }, indexName?: string) {
    const command = new QueryCommand({
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: keyCondition.expression,
      ExpressionAttributeValues: keyCondition.values
    })
    
    const result = await docClient.send(command)
    return result.Items || []
  }
}