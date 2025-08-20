import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Mock data for social networks
const mockSocialLinks = {
  "John Smith": {
    instagram: "https://instagram.com/john_smith",
    facebook: "https://facebook.com/john.smith",
    twitter: "https://twitter.com/john_smith"
  },
  "Sarah Johnson": {
    instagram: "https://instagram.com/sarah_johnson",
    facebook: "https://facebook.com/sarah.johnson",
    twitter: "https://twitter.com/sarah_johnson"
  },
  "Michael Brown": {
    instagram: "https://instagram.com/michael_brown",
    facebook: "https://facebook.com/michael.brown",
    twitter: "https://twitter.com/michael_brown"
  }
};

// Function to find social links (mock)
function findSocialLinks(firstName, lastName, birthDate) {
  const fullName = `${firstName} ${lastName}`;
  
  // Simulate Google search
  console.log(`Searching social networks for: ${fullName} (${birthDate})`);
  
  // Return mock data or generate new ones
  if (mockSocialLinks[fullName]) {
    return mockSocialLinks[fullName];
  }
  
  // Generate mock links for new users
  const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
  return {
    instagram: `https://instagram.com/${username}`,
    facebook: `https://facebook.com/${username}`,
    twitter: `https://twitter.com/${username}`,
    linkedin: `https://linkedin.com/in/${username}`
  };
}

// Create MCP server
const server = new Server(
  {
    name: 'user-data-enrichment-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {
        listChanged: true
      },
    },
  }
);

// Register tool for user data enrichment
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.log('MCP List Tools Request');
  const tools = {
    tools: [
      {
        name: 'enrich_user_data',
        description: 'Enriches user data by adding social network links',
        inputSchema: {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
              description: 'User first name'
            },
            lastName: {
              type: 'string',
              description: 'User last name'
            },
            birthDate: {
              type: 'string',
              description: 'Birth date in YYYY-MM-DD format'
            }
          },
          required: ['firstName', 'lastName', 'birthDate']
        }
      }
    ]
  };
  console.log('MCP List Tools Response:', JSON.stringify(tools, null, 2));
  return tools;
});

// Tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.log('===============================================');
  console.log('MCP Tool Call Request:', JSON.stringify(request, null, 2));
  
  const { name, arguments: args } = request.params;

  if (name === 'enrich_user_data') {
    const { firstName, lastName, birthDate } = args;
    
    console.log(`Processing tool call: ${name}`);
    console.log(`Arguments: firstName=${firstName}, lastName=${lastName}, birthDate=${birthDate}`);
    
    // Get social links
    const socialLinks = findSocialLinks(firstName, lastName, birthDate);
    
    // Form enriched data
    const enrichedData = {
      user: {
        firstName,
        lastName,
        birthDate
      },
      socialLinks
    };

    console.log('=== Tool call result:', JSON.stringify(enrichedData, null, 2));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(enrichedData, null, 2)
        }
      ]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});



// Start server via stdio
const transport = new StdioServerTransport();
await server.connect(transport);

console.log('MCP server started via stdio');

