// Initialize handler for MCP
export function handleInitialize(req) {
  console.log('Handling initialize request');
  const response = {
    jsonrpc: '2.0',
    id: req.body.id, // Use exact ID from request
    result: {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {
          listChanged: true
        },
        resources: {
          subscribe: false,
          listChanged: true
        }
      },
      serverInfo: {
        name: 'mcp-user-data-enrichment',
        version: '1.0.0'
      }
    }
  };
  console.log('Initialize response:', JSON.stringify(response, null, 2));
  return response;
}
