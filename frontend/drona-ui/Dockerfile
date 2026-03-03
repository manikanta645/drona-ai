# Production Frontend Dockerfile - Multi-stage build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# Production stage
FROM node:18-alpine

# Install serve to run the app
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy built app from builder
COPY --from=builder /app/build ./build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -q --spider http://localhost:3000/ || exit 1

# Set environment
ENV NODE_ENV=production

# Run the app
CMD ["serve", "-s", "build", "-l", "3000"]
