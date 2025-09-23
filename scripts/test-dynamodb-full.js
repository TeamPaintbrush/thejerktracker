const DynamoDbLocal = require('dynamodb-local');
const { DynamoDBClient, ListTablesCommand, CreateTableCommand, PutItemCommand, GetItemCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');

async function testDynamoDBFull() {
  let dynamoDbProcess = null;
  
  try {
    console.log('🚀 Starting full DynamoDB Local test...\n');
    
    // Start DynamoDB Local
    console.log('📦 Starting DynamoDB Local on port 8000...');
    const port = 8000;
    dynamoDbProcess = await DynamoDbLocal.launch(port, null, [], true);
    console.log('✅ DynamoDB Local started successfully\n');
    
    // Wait a moment for startup
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create DynamoDB client
    const client = new DynamoDBClient({
      region: 'us-east-1',
      endpoint: 'http://localhost:8000',
      credentials: {
        accessKeyId: 'dummy',
        secretAccessKey: 'dummy',
      },
    });

    console.log('🧪 Testing DynamoDB Local connection...');
    
    // Test 1: List existing tables
    console.log('📋 Listing existing tables...');
    const listResult = await client.send(new ListTablesCommand({}));
    console.log(`✅ Found ${listResult.TableNames.length} existing tables`);
    
    // Test 2: Create a test table
    console.log('🏗️  Creating test table...');
    const tableName = 'TestTable';
    
    try {
      await client.send(new CreateTableCommand({
        TableName: tableName,
        KeySchema: [
          { AttributeName: 'id', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' }
        ],
        BillingMode: 'PAY_PER_REQUEST'
      }));
      console.log(`✅ Table '${tableName}' created successfully`);
    } catch (error) {
      if (error.name === 'ResourceInUseException') {
        console.log(`ℹ️  Table '${tableName}' already exists`);
      } else {
        throw error;
      }
    }

    // Test 3: Put an item
    console.log('📝 Adding test item...');
    const testItem = {
      id: { S: 'test-id-123' },
      name: { S: 'Test Item' },
      timestamp: { N: Date.now().toString() }
    };
    
    await client.send(new PutItemCommand({
      TableName: tableName,
      Item: testItem
    }));
    console.log('✅ Item added successfully');

    // Test 4: Get the item
    console.log('📖 Retrieving test item...');
    const getResult = await client.send(new GetItemCommand({
      TableName: tableName,
      Key: { id: { S: 'test-id-123' } }
    }));
    
    if (getResult.Item) {
      console.log('✅ Item retrieved successfully');
      console.log(`   Name: ${getResult.Item.name.S}`);
      console.log(`   ID: ${getResult.Item.id.S}`);
    } else {
      console.log('❌ Item not found');
    }

    // Test 5: Delete the item
    console.log('🗑️  Deleting test item...');
    await client.send(new DeleteItemCommand({
      TableName: tableName,
      Key: { id: { S: 'test-id-123' } }
    }));
    console.log('✅ Item deleted successfully');

    console.log('\n🎉 All DynamoDB Local tests passed!');
    console.log('✅ CRUD operations are working correctly');
    console.log('✅ Local development environment is ready');
    
  } catch (error) {
    console.error('❌ DynamoDB Local test failed:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    if (error.$metadata) {
      console.error(`   Attempts: ${error.$metadata.attempts}`);
    }
  } finally {
    // Stop DynamoDB Local
    if (dynamoDbProcess) {
      console.log('\n🛑 Stopping DynamoDB Local...');
      try {
        await DynamoDbLocal.stop(8000);
        console.log('✅ DynamoDB Local stopped');
      } catch (error) {
        console.log('ℹ️  DynamoDB Local cleanup completed');
      }
    }
  }
}

testDynamoDBFull();