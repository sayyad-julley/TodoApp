{{#if enableDocker}}
# Use Node.js {{ nodeVersion }} Alpine Linux image
FROM node:{{ nodeVersion }}-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript if needed
{{#if useTypeScript}}
RUN npm run build
{{/if}}

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE {{ port }}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:{{ port }}/health || exit 1

# Start the application
CMD ["npm", "start"]
{{/if}}