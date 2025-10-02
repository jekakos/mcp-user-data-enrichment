import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';


// Mock data for resources
const mockResources = {
  users: [
    {
      id: "user_1",
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      birthDate: "1990-01-01",
      createdAt: "2024-01-15T10:30:00Z"
    },
    {
      id: "user_2", 
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@example.com",
      birthDate: "1985-05-20",
      createdAt: "2024-01-16T14:22:00Z"
    },
    {
      id: "user_3",
      firstName: "Michael", 
      lastName: "Brown",
      email: "michael.brown@example.com",
      birthDate: "1992-11-10",
      createdAt: "2024-01-17T09:15:00Z"
    }
  ],
  socialLinks: [
    {
      id: "link_1",
      userId: "user_1",
      platform: "instagram",
      url: "https://instagram.com/john_smith",
      verified: true,
      lastChecked: "2024-01-20T16:45:00Z"
    },
    {
      id: "link_2",
      userId: "user_1", 
      platform: "facebook",
      url: "https://facebook.com/john.smith",
      verified: true,
      lastChecked: "2024-01-20T16:45:00Z"
    },
    {
      id: "link_3",
      userId: "user_2",
      platform: "instagram", 
      url: "https://instagram.com/sarah_johnson",
      verified: false,
      lastChecked: "2024-01-19T12:30:00Z"
    }
  ],
  analytics: {
    totalUsers: 3,
    totalSocialLinks: 3,
    verifiedLinks: 2,
    lastUpdated: "2024-01-20T16:45:00Z"
  }
};





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
      resources: {
        subscribe: false,
        listChanged: true
      }
    },
  }
);

// Register tool for user data enrichment
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.log('MCP List Tools Request');
  const tools = {
    tools: [
      {
        name: 'echo_data',
        description: 'Echo data tool for proxy testing - returns the same data that was sent in parameters',
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
            },
            email: {
              type: 'string',
              description: 'User email address'
            },
            password: {
              type: 'string',
              description: 'User password'
            },
            text: {
              type: 'string',
              description: 'Additional text data'
            }
          },
          required: ['firstName', 'lastName', 'birthDate', 'email', 'password', 'text']
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

  if (name === 'echo_data') {
    const { firstName, lastName, birthDate, email, password, text } = args;
    
    console.log(`Processing tool call: ${name}`);
    console.log(`Arguments: firstName=${firstName}, lastName=${lastName}, birthDate=${birthDate}, email=${email}, password=${password}, text=${text}`);
    
    // Echo back the same data that was received
    const echoData = {
      firstName,
      lastName,
      birthDate,
      email,
      password,
      text,
      echo_data: {
        firstName,
        lastName,
        birthDate,
        email,
        password,
        text
      }
    };

    console.log('=== Tool call result (echoed data):', JSON.stringify(echoData, null, 2));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(echoData, null, 2)
        }
      ]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Register resource list handler
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  console.log('MCP List Resources Request');
  const resources = {
    resources: [
      {
        uri: 'users://list',
        name: 'Users List',
        description: 'List of all users in the system',
        mimeType: 'application/json'
      },
      {
        uri: 'users-bio://user_1',
        name: 'John Smith Bio',
        description: 'Extended user data for John Smith with social links in JSON format wrapped in text',
        mimeType: 'text/plain'
      },
      {
        uri: 'users-bio://user_2',
        name: 'Sarah Johnson Bio',
        description: 'Extended user data for Sarah Johnson with social links in JSON format wrapped in text',
        mimeType: 'text/plain'
      },
      {
        uri: 'users-bio://user_3',
        name: 'Michael Brown Bio',
        description: 'Extended user data for Michael Brown with social links in JSON format wrapped in text',
        mimeType: 'text/plain'
      }
    ]
  };
  console.log('MCP List Resources Response:', JSON.stringify(resources, null, 2));
  return resources;
});

// Register resource read handler
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  console.log('MCP Read Resource Request:', JSON.stringify(request, null, 2));
  
  const { uri } = request.params;
  
  let content;
  let mimeType = 'application/json';
  
  if (uri === 'users://list') {
    content = JSON.stringify(mockResources.users, null, 2);
  } else if (uri === 'users-bio://user_1' || uri === 'users-bio://user_2' || uri === 'users-bio://user_3') {
    // Specific user bio resources
    mimeType = 'text/plain';
    const userId = uri.replace('users-bio://', '');
    const user = mockResources.users.find(u => u.id === userId);
    
    if (!user) {
      throw new Error(`User not found: ${userId}. Available users: ${mockResources.users.map(u => u.id).join(', ')}`);
    }
    
    const userSocialLinks = mockResources.socialLinks.filter(link => link.userId === userId);
    const enrichedUser = {
      ...user,
      socialLinks: userSocialLinks,
      bio: generateBio(user),
      interests: generateInterests(user),
      location: generateLocation(user),
      lastActive: "2024-01-20T16:45:00Z"
    };
    
    content = `USER EXTENDED BIO - ${user.firstName} ${user.lastName}
=====================================

This resource contains extended user data including social links and biographical information.

JSON Data:
${JSON.stringify(enrichedUser, null, 2)}

Generated: ${new Date().toISOString()}
Resource URI: ${uri}
User ID: ${userId}
`;
  } else {
    throw new Error(`Unknown resource: ${uri}`);
  }
  
  console.log('MCP Read Resource Response - Content length:', content.length);
  
  return {
    contents: [
      {
        uri,
        mimeType,
        text: content
      }
    ]
  };
});

// Start server via stdio
const transport = new StdioServerTransport();
await server.connect(transport);

console.log('MCP server started via stdio');

