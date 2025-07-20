# CommitteeClash

Welcome to the CommitteeClash repository. CommitteeClash is a website application for the competition between our committees.

# Environment file

To get everything to work, you have to create a .env file in the root of the repository. The .env file should contain the following variables:

- HOST_URL: The url the website is running on
- OAUTH_PROVIDER_URL: The OAUTH provider (e.g. https://koala.dev.svsticky.nl)
- OAUTH_CLIENT_ID: The client id for the OAUTH
- OAUTH_CLIENT_SECRET: The client secret for the OAUTH
- POSTGRES_PASSWORD: The password for the database (only needed for production mode)

For testing set the HOST_URL to http://localhost:3000.
Sticky members can setup the OAUTH variables on https://koala.dev.svsticky.nl.

# Docker

To compose the services, use the following commands:

- For development: `docker compose -f docker-compose.dev.yml up --build`
- For production: `docker compose -f docker-compose.prod.yml up --build`

To delete images and containers, use the following command: `docker compose down --rmi local`

# Development

After starting up development, you can find the home page on http://localhost:3000.

## Swagger

You can find and test the Web API endpoints with the help of swagger when running development mode. Swagger is accessable on http://localhost:8080/docs.

# Documentation

After starting up development, you can find the home page of the documentation website on http://localhost:3001.

## Update documentation

There are scripts to generate automatic documentation based on summaries and function headers.
To update the documentation site, please run the following commands before composing the docker containers:

- Frontend: `node docs/scripts/generate-frontend-docs.mjs`
- Backend: `node docs/scripts/generate-backend-docs.js`

The API documentation is updated automatically when starting development.
