# Deployment Guide

## GitHub Deployment

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `mcp-user-data-enrichment`
3. Make it public (required for Smithery integration)
4. Don't initialize with README (we already have one)

### 2. Push to GitHub

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: MCP User Data Enrichment Server"

# Add remote repository (replace with your GitHub username)
git remote add origin https://github.com/jekakos/mcp-user-data-enrichment.git

# Push to GitHub
git push -u origin main
```

### 3. Update package.json

Before pushing, update the repository URL in `package.json`:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/jekakos/mcp-user-data-enrichment.git"
  }
}
```

## Smithery.ai Integration

### 1. Access Smithery

1. Go to [Smithery.ai](https://smithery.ai/)
2. Sign up or log in to your account
3. Navigate to the MCP Servers section

### 2. Add MCP Server

1. Click "Add MCP Server"
2. Choose "From GitHub Repository"
3. Enter your repository URL: `https://github.com/yourusername/mcp-user-data-enrichment`
4. Configure the server:
   ```json
   {
     "command": "node",
     "args": ["src/mcp-server.js"],
     "env": {}
   }
   ```

### 3. Test Integration

1. In Smithery, go to the Tools section
2. You should see `enrich_user_data` tool available
3. Test with sample data:
   ```json
   {
     "firstName": "John",
     "lastName": "Smith",
     "birthDate": "1990-01-01"
   }
   ```

### 4. Use in AI Agent

```javascript
// In your Smithery agent workflow
const result = await mcp.callTool('enrich_user_data', {
  firstName: 'Alice',
  lastName: 'Johnson',
  birthDate: '1992-08-15'
});

// Process the result
const enrichedData = JSON.parse(result.content[0].text);
console.log('Social links:', enrichedData.socialLinks);
```

## Alternative: Direct MCP Integration

If Smithery doesn't support direct GitHub integration, you can:

### 1. Deploy to a Cloud Platform

Deploy your server to a platform like:
- **Vercel** (for HTTP wrapper)
- **Railway**
- **Heroku**
- **DigitalOcean App Platform**

### 2. Use MCP Configuration

In Smithery, use the MCP configuration:

```json
{
  "mcpServers": {
    "user-data-enrichment": {
      "command": "curl",
      "args": ["-X", "POST", "https://your-deployed-app.vercel.app/enrich-user", "-H", "Content-Type: application/json", "-d"]
    }
  }
}
```

## Verification

### 1. Test Locally

```bash
# Test MCP server
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node src/mcp-server.js

# Test HTTP server
curl -X POST http://localhost:3000/enrich-user \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", "lastName": "Smith", "birthDate": "1990-01-01"}'
```

### 2. Test in Smithery

1. Verify the tool appears in Smithery's tool list
2. Test with known users (John Smith, Sarah Johnson, Michael Brown)
3. Test with new users to verify dynamic generation

## Troubleshooting

### Common Issues

1. **Repository not found**: Ensure the repository is public
2. **MCP server not starting**: Check Node.js version and dependencies
3. **Tool not appearing**: Verify the MCP server is properly configured
4. **Connection errors**: Check network connectivity and firewall settings

### Debug Steps

1. Test the MCP server locally first
2. Check Smithery logs for error messages
3. Verify the repository URL is correct
4. Ensure all dependencies are properly listed in package.json

## Support

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Smithery.ai Documentation](https://smithery.ai/docs)
- [GitHub Issues](https://github.com/yourusername/mcp-user-data-enrichment/issues)
