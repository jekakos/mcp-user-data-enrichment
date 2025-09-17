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
          birthDate: '1995-12-25',
          email: 'david.wilson@example.com'
        }
      })
    });
    
    const callResult = await callResponse.json();
    console.log('Result:', JSON.stringify(callResult.data, null, 2));
    console.log('');

    // 6. Test resources list
    console.log('6. Testing resources list...');
    const resourcesResponse = await fetch(`${BASE_URL}/resources`);
    const resources = await resourcesResponse.json();
    console.log('Resources:', JSON.stringify(resources.data, null, 2));
    console.log('');

    // 7. Test reading specific resources
    console.log('7. Testing resource reading...');
    
    // Test users list
    console.log('7a. Reading users list...');
    const usersResponse = await fetch(`${BASE_URL}/resources/read?uri=users://list`);
    const users = await usersResponse.json();
    console.log('Users:', JSON.stringify(users.data, null, 2));
    console.log('');

    // Test extended user bio (JSON wrapped in text) - Dynamic path
    console.log('7b. Reading John Smith extended bio (dynamic path)...');
    const bioResponse1 = await fetch(`${BASE_URL}/resources/read?uri=users-bio://user_1`);
    const bio1 = await bioResponse1.json();
    console.log('Extended Bio for user_1 (text with JSON):');
    console.log(bio1.data.contents[0].text);
    console.log('');

    // Test another user with dynamic path
    console.log('7c. Reading Sarah Johnson extended bio (dynamic path)...');
    const bioResponse2 = await fetch(`${BASE_URL}/resources/read?uri=users-bio://user_2`);
    const bio2 = await bioResponse2.json();
    console.log('Extended Bio for user_2 (text with JSON):');
    console.log(bio2.data.contents[0].text);
    console.log('');

    // Test non-existent user (should show error)
    console.log('7d. Testing non-existent user (should show error)...');
    try {
      const bioResponse3 = await fetch(`${BASE_URL}/resources/read?uri=users-bio://user_999`);
      const bio3 = await bioResponse3.json();
      console.log('Response:', JSON.stringify(bio3, null, 2));
    } catch (error) {
      console.log('Expected error for non-existent user:', error.message);
    }
    console.log('');

    console.log('All tests passed successfully!');

  } catch (error) {
    console.error('Error during testing:', error.message);
    console.log('\nMake sure the server is running on port 3000: npm start');
  }
}

// Run tests
testServer();

