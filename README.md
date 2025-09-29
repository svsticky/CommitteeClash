# CommitteeClash

Welcome to the CommitteeClash repository. CommitteeClash is a website application for the competition between our committees.

# Environment file

To get the application working, you have to create a .env file in the root of the repository. Please copy the content of the sample.env and fill in the missing values. See [OAuth](#oauth) for the information about how to get the OAUTH_CLIENT_ID.

# Secrets

The application uses two secrets. Please create the following files in the root of the repository:

- oauth_client_secret.secret: Set this file’s content to the OAuth client id. See [OAuth](#oauth) for the information about how to get this value.
- postgres_password.secret: Set this file’s content to the password you want PostgreSQL to use for the postgres user.

# Docker

The application works with docker. Make sure you have docker installed and running. To compose the services, use the following commands:

- For development: `docker compose -f docker-compose.dev.yml up --build`
- For production: `docker compose -f docker-compose.prod.yml up --build`

# Development

After starting up development, you can find the home page on http://localhost:3000.

## Swagger

You can find and test the Web API endpoints with the help of swagger when running development mode. Swagger is accessable on http://localhost:8080/docs.

# Documentation

The project generates documentation automatically. The documentation can be found on https://docs.committeeclash.svsticky.nl/. After starting the project, you can find the home page of the documentation website on http://localhost:3001.

# OAuth

The application uses OAuth for authorization and authentication. You have to set up the following set `<Your frontend url>/api/auth/callback/<Your OAUTH_PROVIDER_NAME in env file>` as callback url at your OAuth provider.

The OAuth provider settings for Sticky (Koala) can be found on koala.dev.svsticky.nl/api/oauth/applications for development and koala.svsticky.nl/api/oauth/applications for production.
