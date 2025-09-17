import express from 'express';
import { mcpManager } from './mcp-manager.js';
import { handleMCPRequest } from './handlers/mcp-handler.js';

const app = express();
const PORT = process.env.PORT || 8081;

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

// Start MCP server on application startup
await mcpManager.start();

// Streamable HTTP MCP endpoint for Smithery
app.all('/mcp', handleMCPRequest);

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