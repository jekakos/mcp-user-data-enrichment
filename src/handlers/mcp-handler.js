// Main MCP request handler
import { handleInitialize } from './initialize.js';
import { handleToolsList, handleToolsCall } from './tools.js';
import { handleResourcesList, handleResourcesRead } from './resources.js';
import { handleNotificationsInitialized, handlePing } from './notifications.js';
import { mcpManager } from '../mcp-manager.js';

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

export async function handleMCPRequest(req, res) {
  try {
    console.log(`=== Streamable HTTP MCP Request: ${req.method} /mcp ===`);
    console.log('Headers:', req.headers);
    console.log('Query params:', req.query);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
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
        // Handle different types of POST requests
        const { method, params, name, arguments: args } = req.body;
        
        if (method === 'initialize') {
          const result = handleInitialize(req);
          res.json(result);
          
          // Log that initialization is complete
          console.log('Initialization complete - waiting for tools/list request from Smithery');
        } else if (method === 'tools/list') {
          const result = await handleToolsList(req);
          res.json(result);
        } else if (method === 'tools/call') {
          const result = await handleToolsCall(req);
          res.json(result);
        } else if (method === 'resources/list') {
          const result = await handleResourcesList(req);
          res.json(result);
        } else if (method === 'resources/read') {
          const result = await handleResourcesRead(req);
          res.json(result);
        } else if (method === 'notifications/initialized') {
          handleNotificationsInitialized(req);
          res.status(200).end();
        } else if (method === 'ping') {
          const result = handlePing(req);
          res.json(result);
        } else {
          // Fallback for direct tool calls (legacy format)
          console.log('Handling direct tool call');
          const result = await mcpManager.callTool(name, args);
          res.json({
            jsonrpc: '2.0',
            id: req.body.id, // Use exact ID from request
            result: result
          });
        }
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
}
