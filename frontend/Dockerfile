FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy all files (excluding those in .dockerignore)
# This ensures tsconfig.json and all source files are included
COPY . .

# Verify critical files exist before building
RUN test -f src/lib/api.ts || (echo "ERROR: src/lib/api.ts not found!" && ls -la src/lib/ && exit 1) && \
    test -f tsconfig.json || (echo "ERROR: tsconfig.json not found!" && exit 1) && \
    echo "All required files present, proceeding with build..."

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.js ./

# Install only production dependencies
RUN npm ci --only=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

