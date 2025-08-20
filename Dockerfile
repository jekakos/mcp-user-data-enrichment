FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/

CMD ["node", "src/mcp-server.js"]
