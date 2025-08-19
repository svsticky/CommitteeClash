import { readdir, rename, rm, rmdir } from "fs/promises";
import * as OpenAPI from "fumadocs-openapi";
import path from "path";
import { generateIndexFiles } from "./generate-index-files.mjs";

const out = "./content/docs/API";
const swaggerFilePath = "./swagger.json";

// Clean generated files
await rm(out, { recursive: true, force: true });

// Fetch swagger.json and generate documentation
async function main() {
    console.log("Generating API documentation...");
    await OpenAPI.generateFiles({
        // input files
        input: [swaggerFilePath],
        output: out,
        per: "operation",
        groupBy: "tag",
        transform: (operation) => {
            operation.summary = `${operation.method.toUpperCase()} ${operation.operationId || operation.summary}`;

            operation.slug =
                `${operation.tags?.[0] || "default"}-${operation.operationId || operation.method}`.toLowerCase();

            return operation;
        },
    });

    await flattenMDXFiles(out);
    await renameControllerFolderNames(out);
    generateIndexFiles(out, "Controllers", true);

    console.log("API documentation generated successfully!");
}

// Function for moving mdx files one file up and give them the name of the folder they were in
async function flattenMDXFiles(baseDir) {
    const controllers = (
        await readdir(baseDir, { withFileTypes: true })
    ).filter((dirent) => dirent.isDirectory());

    for (const controller of controllers) {
        const controllerPath = path.join(baseDir, controller.name);

        const endpoints = (
            await readdir(controllerPath, { withFileTypes: true })
        ).filter((dirent) => dirent.isDirectory());

        for (const endpoint of endpoints) {
            const endpointPath = path.join(controllerPath, endpoint.name);

            // find mdx file in endpoint folder
            const mdxFiles = (await readdir(endpointPath)).filter((f) =>
                f.endsWith(".mdx"),
            );

            if (mdxFiles.length === 0) continue;

            const mdxFile = mdxFiles[0]; // take the file
            const oldPath = path.join(endpointPath, mdxFile);
            const newPath = path.join(controllerPath, `${endpoint.name}.mdx`); // Rename the file to the endpoint name

            // Move it to the controller folder
            await rename(oldPath, newPath);

            // Remove the old folder
            await rmdir(endpointPath);
        }
    }
}

// Function for fixing controller folder names
async function renameControllerFolderNames(baseDir) {
    const controllers = (
        await readdir(baseDir, { withFileTypes: true })
    ).filter((dirent) => dirent.isDirectory());

    for (const controller of controllers) {
        const newName = controller.name
            .split("-")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join("");

        await rename(
            path.join(baseDir, controller.name),
            path.join(baseDir, newName),
        );
    }
}

// Run the main function
main().catch((error) => {
    console.error("Error generating documentation:", error);
    process.exit(1);
});
