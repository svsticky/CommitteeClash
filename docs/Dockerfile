# -- Generation dependencies with .net, nodejs and npm and all packages for documentation generation
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS generation-deps
WORKDIR /app
RUN apk add --no-cache bash nodejs npm
RUN dotnet new tool-manifest --name dotnet-tools
RUN dotnet tool install --global Swashbuckle.AspNetCore.Cli
RUN dotnet tool install -g NSwag.ConsoleCore
ENV PATH="$PATH:/root/.dotnet/tools"
RUN dotnet tool install -g docfx

# -- Install node dependencies for the project
FROM node:lts-alpine AS project-deps
WORKDIR /app
COPY docs/package.json docs/package-lock.json* docs/source.config.ts ./
RUN npm ci --ignore-scripts

# -- Development
FROM generation-deps AS development
WORKDIR /app/docs
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3001
ENV PORT=3001
ENV DOTNET_ENVIRONMENT=docs

# Create custom entrypoint script to run npm ci as well to update everything
ENTRYPOINT npm ci --ignore-scripts && npm run dev --turbopack

# -- Docs generator for production
FROM generation-deps AS docs-generator
WORKDIR /app

# Copy the content
COPY docs ./docs
COPY backend ./backend
COPY frontend ./frontend

# install modules for frontend
WORKDIR /app/frontend
RUN npm install

# Generate documentation
WORKDIR /app/docs
ENV DOTNET_ENVIRONMENT=docs
RUN npm install
RUN npm run build-docs

# -- Build the app for production
FROM generation-deps AS builder
WORKDIR /app

# Copy the generated dependencies for the project
COPY --from=project-deps /app/node_modules ./node_modules

# Copy the docs next project
COPY docs .

# Copy the generated documentation
COPY --from=docs-generator /app/docs/content/docs/API ./content/docs/API
COPY --from=docs-generator /app/docs/content/docs/backend ./content/docs/backend
COPY --from=docs-generator /app/docs/content/docs/frontend ./content/docs/frontend

# Build the next project
ENV NEXT_TELEMETRY_DISABLED=1 
RUN npm run build

# -- Run the app as production
FROM node:lts-alpine AS production
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
EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
