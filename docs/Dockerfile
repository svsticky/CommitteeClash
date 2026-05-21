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

COPY docs/package.json ./
COPY docs/package-lock.json ./
COPY docs/source.config.ts ./

RUN npm ci --ignore-scripts

# -- Development
FROM generation-deps AS development
WORKDIR /app/docs
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3001
ENV PORT=3001
ENV DOTNET_ENVIRONMENT=docs

ENTRYPOINT npm ci --ignore-scripts && npm run dev --turbopack

# -- Docs generator for production
FROM generation-deps AS docs-generator
WORKDIR /app

COPY docs ./docs
COPY backend ./backend
COPY frontend ./frontend

WORKDIR /app/frontend
RUN npm install --ignore-scripts --no-audit --no-fund

WORKDIR /app/docs
ENV DOTNET_ENVIRONMENT=docs
RUN npm install --ignore-scripts --no-audit --no-fund
RUN npm run build-docs

# -- Build the app for production
FROM generation-deps AS builder
WORKDIR /app

COPY docs .

COPY --from=project-deps /app/node_modules ./node_modules

COPY --from=docs-generator /app/docs/content/docs/API ./content/docs/API
COPY --from=docs-generator /app/docs/content/docs/backend ./content/docs/backend
COPY --from=docs-generator /app/docs/content/docs/frontend ./content/docs/frontend
COPY --from=docs-generator /app/docs/swagger.json ./swagger.json

ENV NEXT_TELEMETRY_DISABLED=1 
RUN npm run build

# -- Run the app as production
FROM node:lts-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=docs-generator /app/docs/swagger.json ./swagger.json

USER nextjs
EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]