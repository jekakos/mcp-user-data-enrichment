// Resources handlers for MCP
import { mcpManager } from '../mcp-manager.js';

export async function handleResourcesList(req) {
  console.log('Handling resources/list request');
  try {
    const resources = await mcpManager.listResources();
    const response = {
      jsonrpc: '2.0',
      id: req.body.id, // Use exact ID from request
      result: resources
    };
    console.log('Resources/list response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('Error in resources/list:', error);
    const errorResponse = {
      jsonrpc: '2.0',
      id: req.body.id, // Use exact ID from request
      error: {
        code: -32603,
        message: error.message || 'Internal error'
      }
    };
    console.log('Resources/list error response:', JSON.stringify(errorResponse, null, 2));
    return errorResponse;
  }
}

export async function handleResourcesRead(req) {
  console.log('Handling resources/read request');
  const { method, params } = req.body;
  const uri = params?.uri;
  console.log('Resource URI:', uri);
  
  try {
    const resource = await mcpManager.readResource(uri);
    const response = {
      jsonrpc: '2.0',
      id: req.body.id, // Use exact ID from request
      result: resource
    };
    console.log('Resources/read response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('Error in resources/read:', error);
    const errorResponse = {
      jsonrpc: '2.0',
      id: req.body.id, // Use exact ID from request
      error: {
        code: -32603,
        message: error.message || 'Internal error'
      }
    };
    console.log('Resources/read error response:', JSON.stringify(errorResponse, null, 2));
    return errorResponse;
  }
}
