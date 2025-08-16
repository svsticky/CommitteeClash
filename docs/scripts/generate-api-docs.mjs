import * as OpenAPI from "fumadocs-openapi";
import fs from "node:fs/promises";
import { rimrafSync } from "rimraf";

const out = "./content/docs/api";
const swaggerURL = `${process.env.API_URL}/swagger/v1/swagger.json`;
const swaggerFilePath = "./swagger.json";

// Fetch Swagger JSON from the API endpoint, with delay because the API may not be ready yet.
async function fetchSwaggerJSON() {
    const MAX_RETRIES = 20;
    const RETRY_DELAY = 2000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(
                `Fetching Swagger JSON from ${swaggerURL} (attempt ${attempt}/${MAX_RETRIES})...`,
            );
            const response = await fetch(swaggerURL);

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch Swagger JSON: ${response.statusText}`,
                );
            }

            const swaggerData = await response.json();

            await fs.writeFile(
                swaggerFilePath,
                JSON.stringify(swaggerData, null, 2),
            );

            console.log(`Swagger JSON saved to ${swaggerFilePath}`);

            return true;
        } catch (error) {
            console.error(
                `Error fetching Swagger JSON (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`,
            );
            if (attempt < MAX_RETRIES) {
                console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
                await new Promise((resolve) =>
                    setTimeout(resolve, RETRY_DELAY),
                );
            } else {
                console.error("Max retry attempts reached. Giving up.");
                return false;
            }
        }
    }

    return false;
}

// Clean generated files
rimrafSync(out, {
    filter(v) {
        return !v.endsWith("index.mdx") && !v.endsWith("meta.json");
    },
});

// Fetch swagger.json and generate documentation
async function main() {
    const success = await fetchSwaggerJSON();

    if (!success) {
        console.error(
            `Failed to fetch Swagger JSON. Make sure the API is running at ${process.env.API_URL}`,
        );
        process.exit(1);
    }

    console.log("Generating API documentation...");
    await OpenAPI.generateFiles({
        // input files
        input: [swaggerFilePath],
        output: out,
        per: "operation",
        groupBy: "tag",
        transform: (operation, _, doc) => {
            operation.summary = operation.operationId || operation.summary;
            return operation;
        },
    });

    console.log("API documentation generated successfully!");
}

// Run the main function
main().catch((error) => {
    console.error("Error generating documentation:", error);
    process.exit(1);
});
