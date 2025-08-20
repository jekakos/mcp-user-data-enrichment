import express from 'express';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Add CORS headers for Smithery
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Class for managing MCP server (reused from http-wrapper.js)
class MCPServerManager {
  constructor() {
    this.process = null;
    this.isConnected = false;
    this.requestId = 0;
    this.pendingRequests = new Map();
  }

  async start() {
    if (this.process) {
      console.log('MCP server already running');
      return;
    }

    const mcpServerPath = join(__dirname, 'mcp-server.js');
    
    this.process = spawn('node', [mcpServerPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.process.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          try {
            const message = JSON.parse(line);
            this.handleResponse(message);
          } catch (e) {
            // Ignore non-JSON strings (e.g., console.log)
            if (!line.includes('MCP server started') && !line.includes('Searching social networks')) {
              console.log('MCP stdout:', line);
            }
          }
        }
      }
    });

    this.process.stderr.on('data', (data) => {
      console.error('MCP stderr:', data.toString());
    });

    this.process.on('close', (code) => {
      console.log(`MCP process terminated with code ${code}`);
      this.isConnected = false;
      this.process = null;
    });

    this.isConnected = true;
    console.log('MCP server started');
  }

  async stop() {
    if (this.process) {
      this.process.kill();
      this.process = null;
      this.isConnected = false;
      console.log('MCP server stopped');
    }
  }

  async sendRequest(method, params = {}) {
    if (!this.isConnected) {
      throw new Error('MCP server not connected');
    }

    const id = ++this.requestId;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    console.log('MCP Request:', JSON.stringify(request, null, 2));

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      
      const message = JSON.stringify(request) + '\n';
      this.process.stdin.write(message);
      
      // Request timeout
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 10000);
    });
  }

  handleResponse(message) {
    const { id, result, error } = message;
    
    if (this.pendingRequests.has(id)) {
      const { resolve, reject } = this.pendingRequests.get(id);
      this.pendingRequests.delete(id);
      
      if (error) {
        reject(new Error(error.message || 'MCP error'));
      } else {
        resolve(result);
      }
    }
  }

  async listTools() {
    return this.sendRequest('tools/list');
  }

  async callTool(name, arguments_) {
    return this.sendRequest('tools/call', { name, arguments: arguments_ });
  }
}

// Create MCP server manager instance
const mcpManager = new MCPServerManager();

// Start MCP server on application startup
await mcpManager.start();

// Parse configuration from query parameters (for Smithery)
function parseConfig(query) {
  const config = {};
  for (const [key, value] of Object.entries(query)) {
    const keys = key.split('.');
    let current = config;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }
  return config;
}

// Streamable HTTP MCP endpoint for Smithery
app.all('/mcp', async (req, res) => {
  try {
    console.log(`Streamable HTTP MCP Request: ${req.method} /mcp`);
    console.log('Query params:', req.query);
    console.log('Body:', req.body);
    
    // Parse configuration from query parameters
    const config = parseConfig(req.query);
    console.log('Parsed config:', config);
    
    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        // List tools - Streamable HTTP format
        console.log('Handling GET /mcp - List tools');
        const tools = await mcpManager.listTools();
        console.log('Tools response:', JSON.stringify(tools, null, 2));
        const response = {
          jsonrpc: '2.0',
          id: 1,
          result: tools
        };
        console.log('Final response:', JSON.stringify(response, null, 2));
        res.json(response);
        break;
        
      case 'POST':
        // Call tool - Streamable HTTP format
        const { name, arguments: args } = req.body;
        const result = await mcpManager.callTool(name, args);
        res.json({
          jsonrpc: '2.0',
          id: 2,
          result: result
        });
        break;
        
      case 'DELETE':
        // Cleanup
        await mcpManager.stop();
        res.json({ success: true });
        break;
        
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Streamable HTTP MCP endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'mcp-user-data-enrichment',
    mcpConnected: mcpManager.isConnected
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'MCP User Data Enrichment Server',
    version: '1.0.0',
    transport: 'Streamable HTTP',
    endpoints: {
      mcp: '/mcp',
      health: '/health'
    }
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT signal, shutting down...');
  await mcpManager.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM signal, shutting down...');
  await mcpManager.stop();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`Streamable HTTP MCP server started on port ${PORT}`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
