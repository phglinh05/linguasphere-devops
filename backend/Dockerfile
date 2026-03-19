# 1. Base image: Node.js LTS
FROM node:24-alpine

# 2. Set working directory inside container
WORKDIR /app

RUN apk update && apk upgrade --no-cache

# 3. Copy package files first (tối ưu cache)
COPY package*.json ./

# 4. Install dependencies
RUN npm install --omit=dev --ignore-scripts

# Copy application files
COPY server.js ./
COPY src ./src

# Create a non-root user and give ownership of the app directory
# This avoids running the container as root (security best practice)
RUN addgroup -S linguasphere \
    && adduser -S nhom9 -G linguasphere \
    && chown -R nhom9:linguasphere /app

# Switch to non-root user
USER nhom9

# 6. Expose backend port
EXPOSE 5000

# 7. Start the server
CMD ["node", "server.js"]