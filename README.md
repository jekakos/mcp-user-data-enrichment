# MCP User Data Enrichment Server

A Model Context Protocol (MCP) server that enriches user data by adding social network links. This server can be integrated with AI platforms like [Smithery.ai](https://smithery.ai/) to provide social media link discovery capabilities.

## Features

- **User Data Enrichment**: Takes user information (name, birth date) and returns social media links
- **Mock Data Support**: Includes pre-configured social links for demonstration
- **Dynamic Generation**: Automatically generates social links for new users
- **MCP Protocol**: Standard MCP implementation via stdio
- **HTTP Wrapper**: Optional HTTP API for remote access
- **Smithery Integration**: Ready for integration with Smithery.ai

## Installation

```bash
npm install mcp-user-data-enrichment
```

## Usage

### As MCP Server (Recommended for Smithery)

```bash
# Direct stdio usage
node src/mcp-server.js

# Or via npm script
npm run mcp
```

### As HTTP Server

```bash
# Start HTTP server on port 3000
npm start
```

## API Endpoints

### HTTP API (when running as server)

- `GET /status` - Server status
- `GET /tools` - List available tools
- `POST /tools/call` - Call any tool
- `POST /enrich-user` - Enrich user data

### MCP Protocol

The server provides one tool: `enrich_user_data`

**Input Schema:**
```json
{
  "firstName": "string",
  "lastName": "string", 
  "birthDate": "string (YYYY-MM-DD)"
}
```

**Output:**
```json
{
  "user": {
    "firstName": "John",
    "lastName": "Smith",
    "birthDate": "1990-01-01"
  },
  "socialLinks": {
    "instagram": "https://instagram.com/john_smith",
    "facebook": "https://facebook.com/john.smith",
    "twitter": "https://twitter.com/john_smith",
    "linkedin": "https://linkedin.com/in/john_smith"
  }
}
```

## Smithery.ai Integration

This MCP server is designed to work with [Smithery.ai](https://smithery.ai/), a platform for AI agent orchestration.

### Setup in Smithery

1. **Deploy your server** to a public repository on GitHub
2. **Configure MCP connection** in Smithery:
   ```json
   {
     "mcpServers": {
       "user-data-enrichment": {
         "command": "node",
         "args": ["path/to/mcp-server.js"]
       }
     }
   }
   ```
3. **Use the tool** in your AI agent workflows

### Example Smithery Usage

```javascript
// In your Smithery agent
const result = await mcp.callTool('enrich_user_data', {
  firstName: 'John',
  lastName: 'Smith', 
  birthDate: '1990-01-01'
});

console.log(result.content[0].text);
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Test MCP server directly
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node src/mcp-server.js
```

## Testing

```bash
# Run test client
node test-client.js

# Test with curl
curl -X POST http://localhost:3000/enrich-user \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", "lastName": "Smith", "birthDate": "1990-01-01"}'
```

## Mock Data

The server includes mock social links for these users:
- John Smith
- Sarah Johnson  
- Michael Brown

For other users, links are generated automatically based on the name.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Deployment Files

- `Dockerfile` - Docker configuration for containerized deployment
- `smithery.yaml` - Smithery.ai configuration file
- `.dockerignore` - Docker ignore file for optimized builds

## Related Links

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Smithery.ai](https://smithery.ai/) - AI Agent Orchestration Platform
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector) - MCP Testing Tool

