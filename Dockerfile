# ──────────────────────────────────────────────
# Stage 1: Install dependencies
# ──────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package files first for better layer caching
COPY app/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# ──────────────────────────────────────────────
# Stage 2: Production image
# ──────────────────────────────────────────────
FROM node:18-alpine AS production

LABEL maintainer="Vino"
LABEL description="Vino DevOps CI/CD Demo Application"

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /usr/src/app

# Copy dependencies from builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy application source
COPY app/ ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "server.js"]
