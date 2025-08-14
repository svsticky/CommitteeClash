# CommitteeClash

Welcome to the CommitteeClash repository. CommitteeClash is a website application for the competition between our committees.

# Environment file

To get the application working, you have to create a .env file in the root of the repository. Please copy the content of the sample.env and fill in the missing values.

# Docker

The application works with docker. To compose the services, use the following commands:

- For development: `npm run dev`
- For production: `npm run prod`

To delete images and containers, use one of the following commands: `npm run down-dev` or `npm run down-prod`.

# Development

After starting up development, you can find the home page on http://localhost:3000.

## Swagger

You can find and test the Web API endpoints with the help of swagger when running development mode. Swagger is accessable on http://localhost:8080/docs.

# Documentation

After starting up development, you can find the home page of the documentation website on http://localhost:3001.

## Update documentation

The frontend and backend documentation is updated automatically when running `npm run dev` or `npm run prod`. The api documentation is updated when running `npm run dev`.
