import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

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

// Helper functions for generating user data
function generateBio(user) {
  const bios = {
    'user_1': "John Smith is a software engineer with 10+ years of experience in web development. He's passionate about technology and enjoys sharing his knowledge on social media platforms.",
    'user_2': "Sarah Johnson is a marketing specialist with expertise in digital campaigns and social media strategy. She loves connecting with people and building communities online.",
    'user_3': "Michael Brown is a data scientist who works with machine learning and AI. He's interested in the intersection of technology and social impact."
  };
  return bios[user.id] || `${user.firstName} ${user.lastName} is a professional with diverse interests and active on social media.`;
}

function generateInterests(user) {
  const interests = {
    'user_1': ["Technology", "Web Development", "Open Source", "Photography"],
    'user_2': ["Marketing", "Social Media", "Community Building", "Travel"],
    'user_3': ["Data Science", "Machine Learning", "AI", "Research"]
  };
  return interests[user.id] || ["Technology", "Professional Development", "Networking"];
}

function generateLocation(user) {
  const locations = {
    'user_1': "San Francisco, CA",
    'user_2': "New York, NY", 
    'user_3': "Seattle, WA"
  };
  return locations[user.id] || "Location not specified";
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
            },
            email: {
              type: 'string',
              description: 'User email address'
            }
          },
          required: ['firstName', 'lastName', 'birthDate', 'email']
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
    const { firstName, lastName, birthDate, email } = args;
    
    console.log(`Processing tool call: ${name}`);
    console.log(`Arguments: firstName=${firstName}, lastName=${lastName}, birthDate=${birthDate}, email=${email}`);
    
    // Get social links
    const socialLinks = findSocialLinks(firstName, lastName, birthDate);
    
    // Form enriched data
    const enrichedData = {
      user: {
        firstName,
        lastName,
        birthDate,
        email
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
        uri: 'users-bio://{userId}',
        name: 'User Extended Bio',
        description: 'Extended user data with social links in JSON format wrapped in text. Use userId parameter (e.g., user_1, user_2, user_3)',
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
  } else if (uri.startsWith('users-bio://')) {
    // Dynamic path: users-bio://{userId}
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

