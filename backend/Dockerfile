# 1. Base image: Node.js LTS
FROM node:18-alpine

# 2. Set working directory inside container
WORKDIR /app

# 3. Copy package files first (tối ưu cache)
COPY package*.json ./

# 4. Install dependencies
RUN npm install --production

# 5. Copy source code
COPY . .

# 6. Expose backend port
EXPOSE 5000

# 7. Start the server
CMD ["node", "server.js"]