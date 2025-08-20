# MCP Inspector Guide

## Connecting to MCP Inspector

### 1. MCP Inspector Installation
MCP Inspector is already installed and available at: http://localhost:6274

### 2. Configuration
The `mcp-inspector-config.json` file is already configured to connect to our server:

```json
{
  "mcpServers": {
    "user-data-enrichment": {
      "command": "node",
      "args": ["/Users/evgeny-kosivtsov/Work/InCountry/mcp-server-test2/src/mcp-server.js"],
      "env": {}
    }
  }
}
```

### 3. Connecting in MCP Inspector

1. Open http://localhost:6274 in your browser
2. In the "MCP Servers" section, click "Add Server"
3. Select "From Config File"
4. Upload the `mcp-inspector-config.json` file
5. Click "Connect"

### 4. Testing

After connecting, you will be able to:

#### View available tools:
- Go to the "Tools" section
- You will see the `enrich_user_data` tool with description and input schema

#### Call a tool:
- Click on the `enrich_user_data` tool
- Fill in the fields:
  - `firstName`: "John"
  - `lastName`: "Smith" 
  - `birthDate`: "1990-01-01"
- Click "Call Tool"
- Get the result with enriched data

### 5. Request Examples

#### Known user (mock data):
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "birthDate": "1990-01-01"
}
```

#### New user (generated data):
```json
{
  "firstName": "Alice",
  "lastName": "Johnson",
  "birthDate": "1992-08-15"
}
```

### 6. Viewing Logs

In MCP Inspector you can:
- See all JSON-RPC requests and responses
- Track tool execution
- Analyze data structure

### 7. Debugging

If problems occur:
1. Check that the server path in the configuration is correct
2. Make sure Node.js is installed and available
3. Check the browser console for errors
4. Ensure the server is not running in another process

### 8. MCP Inspector Advantages

- **Visual interface** for testing MCP servers
- **Automatic validation** of JSON-RPC messages
- **Schema viewing** for tools
- **Request history** and responses
- **MCP protocol debugging**
