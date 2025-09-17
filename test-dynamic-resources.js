// Simple test for dynamic resources
const BASE_URL = 'http://localhost:3001';

async function testDynamicResources() {
  console.log('Testing Dynamic Resources...\n');

  try {
    // 1. List available resources
    console.log('1. Listing resources...');
    const resourcesResponse = await fetch(`${BASE_URL}/resources`);
    const resources = await resourcesResponse.json();
    console.log('Available resources:');
    resources.data.resources.forEach(resource => {
      console.log(`  - ${resource.uri} (${resource.mimeType})`);
      console.log(`    ${resource.description}`);
    });
    console.log('');

    // 2. Test dynamic path with different user IDs
    const userIds = ['user_1', 'user_2', 'user_3'];
    
    for (const userId of userIds) {
      console.log(`2. Testing dynamic path for ${userId}...`);
      const bioResponse = await fetch(`${BASE_URL}/resources/read?uri=users-bio://${userId}`);
      const bio = await bioResponse.json();
      
      if (bio.success) {
        console.log(`✅ Successfully loaded bio for ${userId}`);
        console.log(`   Content length: ${bio.data.contents[0].text.length} characters`);
        console.log(`   MIME type: ${bio.data.contents[0].mimeType}`);
      } else {
        console.log(`❌ Failed to load bio for ${userId}: ${bio.error}`);
      }
      console.log('');
    }

    // 3. Test error handling for non-existent user
    console.log('3. Testing error handling for non-existent user...');
    const errorResponse = await fetch(`${BASE_URL}/resources/read?uri=users-bio://user_999`);
    const errorResult = await errorResponse.json();
    
    if (!errorResult.success) {
      console.log('✅ Correctly handled non-existent user');
      console.log(`   Error: ${errorResult.error}`);
    } else {
      console.log('❌ Should have failed for non-existent user');
    }
    console.log('');

    console.log('Dynamic resources test completed!');

  } catch (error) {
    console.error('Error during testing:', error.message);
    console.log('\nMake sure the server is running: npm start');
  }
}

// Run the test
testDynamicResources();
