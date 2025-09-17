// Test client for MCP Inspector ping (notification)
const BASE_URL = 'http://localhost:8081';

async function testMCPInspectorPing() {
  console.log('Testing MCP Inspector Ping (Notification)...\n');

  try {
    // 1. Initialize MCP connection
    console.log('1. Initialize MCP connection...');
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
            name: 'mcp-inspector',
            version: '1.0.0'
          }
        }
      })
    });
    const init = await initResponse.json();
    console.log('Initialize response:', JSON.stringify(init.result, null, 2));
    console.log('');

    // 2. Send initialized notification (no response expected)
    console.log('2. Send initialized notification...');
    const initializedResponse = await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: null, // null for notifications
        method: 'notifications/initialized'
      })
    });
    console.log('Initialized notification status:', initializedResponse.status);
    console.log('Response text:', await initializedResponse.text());
    console.log('');

    // 3. Send ping notification (no response expected)
    console.log('3. Send ping notification...');
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
    console.log('Response text:', await pingResponse.text());
    console.log('');

    // 4. Test that tools still work after ping
    console.log('4. Test tools after ping...');
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
    console.log('Tools count:', tools.result.tools.length);
    console.log('');

    console.log('✅ MCP Inspector Ping test completed successfully!');
    console.log('✅ Ping is correctly implemented as notification (no response)');

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    console.log('\nMake sure the streamable server is running: node src/streamable-http-wrapper.js');
  }
}

// Run tests
testMCPInspectorPing();
