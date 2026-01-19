FROM mcr.microsoft.com/dotnet/aspnet:9.0

WORKDIR /app

RUN apt-get update \
    && apt-get install -y wget curl \
    && rm -rf /var/lib/apt/lists/*

COPY submittedimages ./submittedimages
COPY publish/ .

EXPOSE 8080
ENTRYPOINT ["dotnet", "backend.dll", "--urls", "http://+:8080"]