// MCP Server Manager (extracted from streamable-http-wrapper.js)
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Class for managing MCP server
export class MCPServerManager {
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

  async listResources() {
    return this.sendRequest('resources/list');
  }

  async readResource(uri) {
    return this.sendRequest('resources/read', { uri });
  }
}

// Create and export singleton instance
export const mcpManager = new MCPServerManager();
