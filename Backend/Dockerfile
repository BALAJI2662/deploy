# Production Dockerfile for Backend
FROM node:20-alpine AS base

# Install dumb-init to properly handle PID 1 and signal forwarding
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy source files
COPY . .

# Set environment
ENV NODE_ENV=production
ENV PORT=8000

# Expose backend port
EXPOSE 8000

# Use non-root user for security
USER node

# Start server using dumb-init
CMD ["dumb-init", "node", "index.js"]
