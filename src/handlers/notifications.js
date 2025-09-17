// Notifications handlers for MCP

export function handleNotificationsInitialized(req) {
  console.log('Handling notifications/initialized notification');
  // This is a notification, no response needed
  return null; // Will be handled as notification
}

export function handlePing(req) {
  console.log('Handling ping request');
  // Ping should return a JSON response, not a notification
  return {
    jsonrpc: '2.0',
    id: req.body.id,
    result: {
      pong: true
    }
  };
}
