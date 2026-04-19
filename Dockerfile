# Stage 1: Install dependencies
FROM node:18-alpine AS builder

WORKDIR /app

COPY app/package*.json ./

RUN npm install --only=production

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY app/ ./

EXPOSE 3000

CMD ["node", "server.js"]
