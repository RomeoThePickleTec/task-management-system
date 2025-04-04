# Base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with legacy peer deps
RUN echo "Installing dependencies..." && \
    npm install --legacy-peer-deps && \
    echo "Dependencies installed successfully"

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install dependencies again with legacy peer deps
RUN echo "Installing dependencies in builder stage..." && \
    npm install --legacy-peer-deps && \
    echo "Builder dependencies installed successfully"

# Build the application
RUN echo "Building application..." && \
    npm run build && \
    echo "Build completed successfully"

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN echo "Creating non-root user..." && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    echo "Non-root user created successfully"

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set the correct permission for prerender cache
RUN echo "Setting permissions..." && \
    mkdir -p .next/cache && \
    chown -R nextjs:nodejs .next && \
    echo "Permissions set successfully"

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set the environment variable for the server
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD echo "Starting application..." && node server.js
