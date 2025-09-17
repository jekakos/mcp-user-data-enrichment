// Notifications handlers for MCP

export function handleNotificationsInitialized(req) {
  console.log('Handling notifications/initialized notification');
  // This is a notification, no response needed
  return null; // Will be handled as notification
}

export function handlePing(req) {
  console.log('Handling ping notification');
  // Ping is a notification, no response needed
  return null; // Will be handled as notification
}
