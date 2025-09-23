const { DynamoDBClient, CreateTableCommand, ListTablesCommand, PutItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

// Configure DynamoDB client for local development
const dynamoClient = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy'
  }
});

async function testDynamoDbLocal() {
  try {
    console.log('🧪 Testing DynamoDB Local connection...');
    
    // Test 1: List existing tables
    console.log('📋 Listing existing tables...');
    const listTablesResult = await dynamoClient.send(new ListTablesCommand({}));
    console.log('Existing tables:', listTablesResult.TableNames);
    
    // Test 2: Create a test table if it doesn't exist
    const testTableName = 'TestTable';
    if (!listTablesResult.TableNames?.includes(testTableName)) {
      console.log('🏗️  Creating test table...');
      await dynamoClient.send(new CreateTableCommand({
        TableName: testTableName,
        KeySchema: [
          {
            AttributeName: 'id',
            KeyType: 'HASH'
          }
        ],
        AttributeDefinitions: [
          {
            AttributeName: 'id',
            AttributeType: 'S'
          }
        ],
        BillingMode: 'PAY_PER_REQUEST'
      }));
      console.log('✅ Test table created successfully');
    } else {
      console.log('ℹ️  Test table already exists');
    }
    
    // Test 3: Put an item
    console.log('📝 Testing PUT operation...');
    const testItem = {
      id: 'test-1',
      name: 'Test Item',
      timestamp: new Date().toISOString()
    };
    
    await dynamoClient.send(new PutItemCommand({
      TableName: testTableName,
      Item: marshall(testItem)
    }));
    console.log('✅ Item created successfully');
    
    // Test 4: Get the item
    console.log('📖 Testing GET operation...');
    const getResult = await dynamoClient.send(new GetItemCommand({
      TableName: testTableName,
      Key: marshall({ id: 'test-1' })
    }));
    
    if (getResult.Item) {
      const retrievedItem = unmarshall(getResult.Item);
      console.log('✅ Item retrieved successfully:', retrievedItem);
    } else {
      console.log('❌ Item not found');
    }
    
    console.log('');
    console.log('🎉 DynamoDB Local is working correctly!');
    console.log('🔗 DynamoDB Local endpoint: http://localhost:8000');
    console.log('📊 You can now start the Next.js application');
    
  } catch (error) {
    console.error('❌ DynamoDB Local test failed:', error);
    console.log('');
    console.log('💡 Make sure DynamoDB Local is running on port 8000');
    console.log('   Run: npm run dev:dynamodb');
  }
}

testDynamoDbLocal();