# Build stage
FROM node:20-alpine AS builder

# OCI Image Labels
LABEL org.opencontainers.image.title="Constellation"
LABEL org.opencontainers.image.description="Visual infrastructure topology dashboard"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="Homelab"
LABEL org.opencontainers.image.source="https://github.com/Enan456/constellation"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV DATA_PATH=/app/data/infrastructure.json

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create data directory and set permissions
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# Copy initial data file
COPY --from=builder --chown=nextjs:nodejs /app/data/infrastructure.json /app/data/

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
