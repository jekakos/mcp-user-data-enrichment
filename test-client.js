// Test client for demonstrating MCP server functionality
const BASE_URL = 'http://localhost:3000';

async function testServer() {
  console.log('Testing MCP server...\n');

  try {
    // 1. Check server status
    console.log('1. Checking server status...');
    const statusResponse = await fetch(`${BASE_URL}/status`);
    const status = await statusResponse.json();
    console.log('Status:', status.data);
    console.log('');

    // 2. Get list of tools
    console.log('2. Getting list of tools...');
    const toolsResponse = await fetch(`${BASE_URL}/tools`);
    const tools = await toolsResponse.json();
    console.log('Tools:', JSON.stringify(tools.data, null, 2));
    console.log('');

    // 3. Test with known user (mock data)
    console.log('3. Testing with known user (John Smith)...');
    const testUser1 = {
      firstName: 'John',
      lastName: 'Smith',
      birthDate: '1990-01-01'
    };
    
    const enrichResponse1 = await fetch(`${BASE_URL}/enrich-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser1)
    });
    
    const result1 = await enrichResponse1.json();
    console.log('Result:', JSON.stringify(result1.data, null, 2));
    console.log('');

    // 4. Test with new user (generated data)
    console.log('4. Testing with new user (Emily Davis)...');
    const testUser2 = {
      firstName: 'Emily',
      lastName: 'Davis',
      birthDate: '1985-05-15'
    };
    
    const enrichResponse2 = await fetch(`${BASE_URL}/enrich-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser2)
    });
    
    const result2 = await enrichResponse2.json();
    console.log('Result:', JSON.stringify(result2.data, null, 2));
    console.log('');

    // 5. Test via general endpoint
    console.log('5. Testing via general endpoint /tools/call...');
    const callResponse = await fetch(`${BASE_URL}/tools/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'enrich_user_data',
        arguments: {
          firstName: 'David',
          lastName: 'Wilson',
          birthDate: '1995-12-25'
        }
      })
    });
    
    const callResult = await callResponse.json();
    console.log('Result:', JSON.stringify(callResult.data, null, 2));
    console.log('');

    console.log('All tests passed successfully!');

  } catch (error) {
    console.error('Error during testing:', error.message);
    console.log('\nMake sure the server is running on port 3000: npm start');
  }
}

// Run tests
testServer();

