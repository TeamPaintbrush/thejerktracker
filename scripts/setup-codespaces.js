#!/usr/bin/env node

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { CreateTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const bcrypt = require('bcryptjs');

async function setupCodespaces() {
  console.log('🚀 Setting up TheJERKTracker for GitHub Codespaces...');
  
  // Configure DynamoDB client for local development
  const dynamoClient = new DynamoDBClient({
    endpoint: 'http://localhost:8000',
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'dummy',
      secretAccessKey: 'dummy'
    }
  });

  const docClient = DynamoDBDocumentClient.from(dynamoClient);

  // Wait for DynamoDB Local to be ready
  console.log('⏳ Waiting for DynamoDB Local to start...');
  await waitForDynamoDB(dynamoClient);

  // Create tables
  const tables = [
    {
      name: 'thejerktracker-users',
      schema: {
        TableName: 'thejerktracker-users',
        KeySchema: [
          { AttributeName: 'id', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' }
        ],
        BillingMode: 'PAY_PER_REQUEST'
      }
    },
    {
      name: 'thejerktracker-orders',
      schema: {
        TableName: 'thejerktracker-orders',
        KeySchema: [
          { AttributeName: 'id', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' }
        ],
        BillingMode: 'PAY_PER_REQUEST'
      }
    },
    {
      name: 'thejerktracker-restaurants',
      schema: {
        TableName: 'thejerktracker-restaurants',
        KeySchema: [
          { AttributeName: 'id', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' }
        ],
        BillingMode: 'PAY_PER_REQUEST'
      }
    }
  ];

  // Create tables
  for (const table of tables) {
    try {
      await dynamoClient.send(new CreateTableCommand(table.schema));
      console.log(`✅ Created table: ${table.name}`);
    } catch (error) {
      if (error.name === 'ResourceInUseException') {
        console.log(`✅ Table already exists: ${table.name}`);
      } else {
        console.error(`❌ Error creating table ${table.name}:`, error.message);
      }
    }
  }

  // Wait a moment for tables to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Create default admin user
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = {
      id: 'admin-001',
      email: 'admin@thejerktracker.com',
      name: 'Admin User',
      role: 'ADMIN',
      password: hashedPassword,
      restaurantId: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: 'thejerktracker-users',
      Item: adminUser
    }));

    console.log('✅ Created admin user: admin@thejerktracker.com / admin123');
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }

  // Create sample restaurant
  try {
    const sampleRestaurant = {
      id: 'restaurant-001',
      name: 'The JERK Spot',
      address: '123 Jerk Street, Kingston, Jamaica',
      phone: '+1-876-555-0123',
      email: 'info@thejerkspot.com',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: 'thejerktracker-restaurants',
      Item: sampleRestaurant
    }));

    console.log('✅ Created sample restaurant: The JERK Spot');
  } catch (error) {
    console.error('❌ Error creating sample restaurant:', error.message);
  }

  console.log('\n🎉 Codespaces setup complete!');
  console.log('\n📋 Quick Start:');
  console.log('   🌐 App: http://localhost:3000');
  console.log('   🔑 Admin Login: admin@thejerktracker.com / admin123');
  console.log('   📊 DynamoDB Local: http://localhost:8000');
  console.log('\n💡 The app should automatically start after this setup completes.');
}

async function waitForDynamoDB(client, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await client.send(new ListTablesCommand({}));
      console.log('✅ DynamoDB Local is ready!');
      return;
    } catch (error) {
      console.log(`⏳ Waiting for DynamoDB Local... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error('DynamoDB Local failed to start');
}

// Run setup
setupCodespaces().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});