const DynamoDbLocal = require('dynamodb-local');

async function startDynamoDb() {
  try {
    console.log('📦 Starting DynamoDB Local on port 8000...');
    
    // Start DynamoDB Local in memory mode (simpler for development)
    const port = 8000;
    
    const dynamoDbLocalProcess = await DynamoDbLocal.launch(port, null, [], true);
    
    console.log('✅ DynamoDB Local started successfully on port 8000');
    console.log('🌐 DynamoDB Local endpoint: http://localhost:8000');
    console.log('💾 Running in memory mode (data will not persist)');
    console.log('');
    console.log('🚀 DynamoDB Local is ready for connections!');
    console.log('📝 Run "npm run test:dynamodb" in another terminal to test');
    console.log('');
    console.log('Press Ctrl+C to stop DynamoDB Local');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping DynamoDB Local...');
      DynamoDbLocal.stop(port);
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Stopping DynamoDB Local...');
      DynamoDbLocal.stop(port);
      process.exit(0);
    });
    
    // Keep process alive using interval instead of stdin
    setInterval(() => {
      // Just keep alive, don't output anything
    }, 30000);
    
  } catch (error) {
    console.error('❌ Failed to start DynamoDB Local:', error);
    process.exit(1);
  }
}

startDynamoDb();