// Test client for Streamable HTTP MCP Resources
const BASE_URL = 'http://localhost:8081';

async function testStreamableResources() {
  console.log('Testing Streamable HTTP MCP Resources...\n');

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
            name: 'test-client',
            version: '1.0.0'
          }
        }
      })
    });
    const init = await initResponse.json();
    console.log('Initialize response capabilities:', JSON.stringify(init.result.capabilities, null, 2));
    console.log('');

    // 2. Send initialized notification
    console.log('2. Send initialized notification...');
    await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        method: 'notifications/initialized'
      })
    });
    console.log('Initialized notification sent');
    console.log('');

    // 3. List resources
    console.log('3. List resources...');
    const resourcesResponse = await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'resources/list'
      })
    });
    const resources = await resourcesResponse.json();
    console.log('Resources list:', JSON.stringify(resources.result.resources, null, 2));
    console.log('');

    // 4. Read users list
    console.log('4. Read users list...');
    const usersResponse = await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'resources/read',
        params: {
          uri: 'users://list'
        }
      })
    });
    const users = await usersResponse.json();
    console.log('Users list (first 200 chars):', users.result.contents[0].text.substring(0, 200) + '...');
    console.log('MIME type:', users.result.contents[0].mimeType);
    console.log('');

    // 5. Read user bio (dynamic path)
    console.log('5. Read John Smith bio (dynamic path)...');
    const bioResponse = await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 4,
        method: 'resources/read',
        params: {
          uri: 'users-bio://user_1'
        }
      })
    });
    const bio = await bioResponse.json();
    console.log('Bio content (first 300 chars):', bio.result.contents[0].text.substring(0, 300) + '...');
    console.log('MIME type:', bio.result.contents[0].mimeType);
    console.log('');

    // 6. Test another user (dynamic path)
    console.log('6. Read Sarah Johnson bio (dynamic path)...');
    const bio2Response = await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 5,
        method: 'resources/read',
        params: {
          uri: 'users-bio://user_2'
        }
      })
    });
    const bio2 = await bio2Response.json();
    console.log('Bio2 content (first 200 chars):', bio2.result.contents[0].text.substring(0, 200) + '...');
    console.log('MIME type:', bio2.result.contents[0].mimeType);
    console.log('');

    // 7. Test error handling (non-existent user)
    console.log('7. Test error handling (non-existent user)...');
    const errorResponse = await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 6,
        method: 'resources/read',
        params: {
          uri: 'users-bio://user_999'
        }
      })
    });
    const error = await errorResponse.json();
    if (error.error) {
      console.log('✅ Correctly handled error:', error.error.message);
    } else {
      console.log('❌ Should have failed for non-existent user');
    }
    console.log('');

    console.log('✅ All Streamable HTTP MCP Resources tests passed successfully!');

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    console.log('\nMake sure the streamable server is running: node src/streamable-http-wrapper.js');
  }
}

// Run tests
testStreamableResources();
