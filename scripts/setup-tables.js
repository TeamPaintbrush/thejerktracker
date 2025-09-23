const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand
} = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');

// Configuration for local development
const dynamoClient = new DynamoDBClient({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy'
  }
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Table names
const TABLES = {
  USERS: 'thejerktracker-users',
  ORDERS: 'thejerktracker-orders',
  RESTAURANTS: 'thejerktracker-restaurants'
};

async function createTable(tableName) {
  try {
    const createCommand = new CreateTableCommand({
      TableName: tableName,
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    });
    
    await dynamoClient.send(createCommand);
    console.log(`✅ Table ${tableName} created successfully`);
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log(`ℹ️  Table ${tableName} already exists`);
    } else {
      console.error(`❌ Error creating table ${tableName}:`, error.message);
    }
  }
}

async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = {
      id: crypto.randomUUID(),
      email: 'admin@thejerktracker.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const command = new PutCommand({
      TableName: TABLES.USERS,
      Item: adminUser,
      ConditionExpression: 'attribute_not_exists(id)'
    });
    
    await docClient.send(command);
    console.log('✅ Admin user created:', adminUser.email);
    return adminUser;
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      console.log('ℹ️  Admin user already exists');
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
  }
}

async function setupTables() {
  try {
    console.log('🏗️  Setting up DynamoDB tables...');
    
    // Create tables
    await createTable(TABLES.USERS);
    await createTable(TABLES.ORDERS);
    await createTable(TABLES.RESTAURANTS);
    
    console.log('👤 Creating admin user...');
    await createAdminUser();
    
    console.log('🎉 Setup complete!');
    console.log('📧 Admin login: admin@thejerktracker.com');
    console.log('🔑 Admin password: admin123');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupTables();