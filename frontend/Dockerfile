# Base image with Node.js LTS on Alpine Linux
FROM node:lts-alpine AS base

# -- Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# -- Development
FROM deps AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
ENV PORT=3000
# Create custom entrypoint script to run npm ci as well to update everything
ENTRYPOINT npm ci --ignore-scripts && npm run dev

# -- Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 
ARG NEXT_PUBLIC_OAUTH_PROVIDER_NAME
ENV NEXT_PUBLIC_OAUTH_PROVIDER_NAME=${NEXT_PUBLIC_OAUTH_PROVIDER_NAME}
ENV OAUTH_CLIENT_ID=$OAUTH_CLIENT_ID
ARG NEXT_PUBLIC_OAUTH_PROVIDER_URL
ENV NEXT_PUBLIC_OAUTH_PROVIDER_URL=${NEXT_PUBLIC_OAUTH_PROVIDER_URL}
ENV THEME_COLOR=$THEME_COLOR
RUN npm run build

# -- Run the app
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]