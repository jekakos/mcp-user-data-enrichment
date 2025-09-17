// Test client for Streamable HTTP MCP wrapper
const BASE_URL = 'http://localhost:8081';

async function testStreamableMCP() {
  console.log('Testing Streamable HTTP MCP Wrapper...\n');

  try {
    // 1. Health check
    console.log('1. Health check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const health = await healthResponse.json();
    console.log('Health:', JSON.stringify(health, null, 2));
    console.log('');

    // 2. Root endpoint
    console.log('2. Root endpoint...');
    const rootResponse = await fetch(`${BASE_URL}/`);
    const root = await rootResponse.json();
    console.log('Root:', JSON.stringify(root, null, 2));
    console.log('');

    // 3. Initialize MCP connection
    console.log('3. Initialize MCP connection...');
    const initResponse = await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'test-client',
            version: '1.0.0'
          }
        }
      })
    });
    const init = await initResponse.json();
    console.log('Initialize response:', JSON.stringify(init, null, 2));
    console.log('');

    // 4. Send initialized notification
    console.log('4. Send initialized notification...');
    const initializedResponse = await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        method: 'notifications/initialized'
      })
    });
    console.log('Initialized notification status:', initializedResponse.status);
    console.log('Initialized response text:', await initializedResponse.text());
    console.log('');

    // 5. List tools
    console.log('5. List tools...');
    const toolsResponse = await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list'
      })
    });
    const tools = await toolsResponse.json();
    console.log('Tools response:', JSON.stringify(tools, null, 2));
    console.log('');

    // 6. Call tool
    console.log('6. Call enrich_user_data tool...');
    const toolCallResponse = await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'enrich_user_data',
          arguments: {
            firstName: 'Alice',
            lastName: 'Wonder',
            birthDate: '1990-05-15',
            email: 'alice.wonder@example.com'
          }
        }
      })
    });
    const toolCall = await toolCallResponse.json();
    console.log('Tool call response:', JSON.stringify(toolCall, null, 2));
    console.log('');

    // 7. Test GET /mcp (list tools)
    console.log('7. Test GET /mcp (list tools)...');
    const getToolsResponse = await fetch(`${BASE_URL}/mcp`);
    const getTools = await getToolsResponse.json();
    console.log('GET tools response:', JSON.stringify(getTools, null, 2));
    console.log('');

    // 8. Test ping (notification)
    console.log('8. Test ping (notification)...');
    const pingResponse = await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: null, // null for notifications
        method: 'ping'
      })
    });
    console.log('Ping notification status:', pingResponse.status);
    console.log('Ping response text:', await pingResponse.text());
    console.log('');

    console.log('✅ All Streamable HTTP MCP tests passed successfully!');

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    console.log('\nMake sure the streamable server is running: node src/streamable-http-wrapper.js');
  }
}

// Run tests
testStreamableMCP();
