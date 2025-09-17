import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Class for managing MCP server
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
            console.log('=====> MCP Response:', JSON.stringify(message, null, 2));
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

    console.log('<===== MCP Request:', JSON.stringify(request, null, 2));

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

  async listResources() {
    return this.sendRequest('resources/list');
  }

  async readResource(uri) {
    return this.sendRequest('resources/read', { uri });
  }
}

// Create MCP server manager instance
const mcpManager = new MCPServerManager();

// Start MCP server on application startup
await mcpManager.start();

// HTTP routes

// Get list of available tools
app.get('/tools', async (req, res) => {
  console.log('<===== HTTP Request: GET /tools');
  try {
    const tools = await mcpManager.listTools();
    console.log('=====> HTTP Response: GET /tools - Success');
    res.json({
      success: true,
      data: tools
    });
  } catch (error) {
    console.error('[X] HTTP Response: GET /tools - Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Call tool
app.post('/tools/call', async (req, res) => {
  console.log('===============================================');
  console.log('<===== HTTP Request: POST /tools/call');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { name, arguments: args } = req.body;
    
    if (!name) {
      console.log('[X] HTTP Response: POST /tools/call - Bad Request (missing tool name)');
      return res.status(400).json({
        success: false,
        error: 'Tool name is required'
      });
    }

    const result = await mcpManager.callTool(name, args);
    console.log('=====> HTTP Response: POST /tools/call - Success');
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[X] HTTP Response: POST /tools/call - Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get list of available resources
app.get('/resources', async (req, res) => {
  console.log('<===== HTTP Request: GET /resources');
  try {
    const resources = await mcpManager.listResources();
    console.log('=====> HTTP Response: GET /resources - Success');
    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    console.error('[X] HTTP Response: GET /resources - Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Read specific resource
app.get('/resources/read', async (req, res) => {
  console.log('<===== HTTP Request: GET /resources/read');
  try {
    const { uri } = req.query;
    
    if (!uri) {
      console.log('[X] HTTP Response: GET /resources/read - Bad Request (missing uri)');
      return res.status(400).json({
        success: false,
        error: 'URI parameter is required'
      });
    }

    const resource = await mcpManager.readResource(uri);
    console.log('=====> HTTP Response: GET /resources/read - Success');
    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('[X] HTTP Response: GET /resources/read - Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Special route for user data enrichment
app.post('/enrich-user', async (req, res) => {
  console.log('HTTP Request: POST /enrich-user');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { firstName, lastName, birthDate } = req.body;
    
    if (!firstName || !lastName || !birthDate) {
      console.log('HTTP Response: POST /enrich-user - Bad Request (missing required fields)');
      return res.status(400).json({
        success: false,
        error: 'firstName, lastName and birthDate are required'
      });
    }

    const result = await mcpManager.callTool('enrich_user_data', {
      firstName,
      lastName,
      birthDate
    });

    console.log('HTTP Response: POST /enrich-user - Success');
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('HTTP Response: POST /enrich-user - Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Server status
app.get('/status', (req, res) => {
  console.log('🔍 HTTP Request: GET /status');
  const response = {
    success: true,
    data: {
      mcpConnected: mcpManager.isConnected,
      timestamp: new Date().toISOString()
    }
  };
  console.log('HTTP Response: GET /status - Success');
  res.json(response);
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

// Start HTTP server
app.listen(PORT, () => {
  console.log(`HTTP server started on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`   GET  /status - server status`);
  console.log(`   GET  /tools - list of tools`);
  console.log(`   POST /tools/call - call tool`);
  console.log(`   GET  /resources - list of resources`);
  console.log(`   GET  /resources/read?uri=<uri> - read specific resource`);
  console.log(`   POST /enrich-user - enrich user data`);
});

