# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Expose port (for HTTP wrapper if needed)
EXPOSE 3000

# Default command - run MCP server via stdio
CMD ["node", "src/mcp-server.js"]
