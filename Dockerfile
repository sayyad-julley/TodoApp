# Multi-stage Dockerfile for Full-Stack Todo App (Production)
# This builds the frontend (React/Vite) and serves it from the backend
# Frontend dev server runs on port 5173, backend API on port 5000

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY golden-path/templates/fullstack-todo/frontend/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source code
COPY golden-path/templates/fullstack-todo/frontend/ ./

# Build frontend for production (Vite dev server runs on 5173, but this is production build)
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY golden-path/templates/fullstack-todo/backend/package*.json ./

# Install backend dependencies (including dev dependencies for build scripts if needed)
RUN npm ci --include=dev

# Copy backend source code
COPY golden-path/templates/fullstack-todo/backend/ ./

# Stage 3: Production Image
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy backend files from builder
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend ./

# Copy built frontend from builder
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/dist ./public

# Install only production dependencies
RUN npm ci --omit=dev && \
    npm cache clean --force

# Expose backend port (frontend is served as static files from backend in production)
# In development, frontend runs separately on port 5173
EXPOSE 5000

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "server.js"]

