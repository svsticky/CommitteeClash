# Build stage - compiles and builds the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["*.csproj", "./"]
RUN dotnet restore
COPY . .
RUN dotnet publish backend.csproj -c Release -o /app/publish



# Development stage - used for local development with hot reload
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS development
WORKDIR /app
ENV DOTNET_WATCH_RESTART_ON_RUDE_EDIT=true
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
ENTRYPOINT ["dotnet", "watch", "--project", "backend.csproj", "run", "--urls", "http://+:8080"]



# Production stage - Builds and runs the application for production
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS production
WORKDIR /app
COPY submittedimages ./submittedimages
RUN apt-get update && apt-get install -y wget curl && rm -rf /var/lib/apt/lists/*
RUN rm -rf Migrations
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "backend.dll", "--urls", "http://+:8080"]