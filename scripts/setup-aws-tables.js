const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand
} = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');

// Configuration for AWS production
const dynamoClient = new DynamoDBClient({
  region: 'us-east-1'
  // Will use default AWS credentials from environment/IAM
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Production table names
const TABLES = {
  USERS: 'thejerktracker-users-prod',
  ORDERS: 'thejerktracker-orders-prod',
  RESTAURANTS: 'thejerktracker-restaurants-prod'
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
      BillingMode: 'PAY_PER_REQUEST' // Serverless pricing
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
    console.log('✅ Production admin user created:', adminUser.email);
    return adminUser;
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      console.log('ℹ️  Production admin user already exists');
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
  }
}

async function setupProductionTables() {
  try {
    console.log('🏗️  Setting up AWS DynamoDB production tables...');
    
    // Create tables
    await createTable(TABLES.USERS);
    await createTable(TABLES.ORDERS);
    await createTable(TABLES.RESTAURANTS);
    
    console.log('👤 Creating production admin user...');
    await createAdminUser();
    
    console.log('🎉 Production setup complete!');
    console.log('📧 Admin login: admin@thejerktracker.com');
    console.log('🔑 Admin password: admin123');
    console.log('');
    console.log('🚀 Ready for AWS Amplify deployment!');
  } catch (error) {
    console.error('❌ Production setup failed:', error);
    process.exit(1);
  }
}

setupProductionTables();