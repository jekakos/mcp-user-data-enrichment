// Tools handlers for MCP
import { mcpManager } from '../mcp-manager.js';

export async function handleToolsList(req) {
  console.log('Handling tools/list request');
  const tools = await mcpManager.listTools();
  const response = {
    jsonrpc: '2.0',
    id: req.body.id, // Use exact ID from request
    result: tools
  };
  console.log('Tools/list response:', JSON.stringify(response, null, 2));
  return response;
}

export async function handleToolsCall(req) {
  console.log('Handling tools/call request');
  const { method, params, name, arguments: args } = req.body;
  const toolName = params?.name || name;
  const toolArgs = params?.arguments || args;
  console.log('Tool name:', toolName);
  console.log('Tool args:', JSON.stringify(toolArgs, null, 2));
  
  try {
    const result = await mcpManager.callTool(toolName, toolArgs);
    const response = {
      jsonrpc: '2.0',
      id: req.body.id, // Use exact ID from request
      result: result
    };
    console.log('Tools/call response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('Error in tools/call:', error);
    const errorResponse = {
      jsonrpc: '2.0',
      id: req.body.id, // Use exact ID from request
      error: {
        code: -32603,
        message: error.message || 'Internal error'
      }
    };
    console.log('Tools/call error response:', JSON.stringify(errorResponse, null, 2));
    return errorResponse;
  }
}
