import { exec as execCb, spawn } from "child_process";
import util from "util";

const exec = util.promisify(execCb);

function runLive(command, args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: "inherit", shell: true });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function waitForHealthy(serviceName) {
  let healthy = false;
  while (!healthy) {
    try {
      const { stdout } = await exec(
        `docker inspect --format='{{.State.Health.Status}}' ${serviceName}`
      );
      healthy = stdout.includes("healthy");
    } catch (e) {}
    if (!healthy) {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

async function getContainerName(serviceName, composeFile) {
  try {
    let containerId = undefined;
    while (!containerId) {
      await new Promise((r) => setTimeout(r, 3000));
      const { stdout } = await exec(
        `docker compose -f ${composeFile} ps -q ${serviceName}`
      );
      containerId = stdout.trim();
    }

    const { stdout: nameOut } = await exec(
      `docker inspect --format='{{.Name}}' ${containerId}`
    );
    return nameOut.trim().replace("/", "").replace("'", "").replace("'", "");
  } catch (e) {
    throw new Error(`Error getting container name: ${e.message}`);
  }
}

async function main() {
  const env = process.argv[2] || "dev";
  const composeFile = `docker-compose.${env}.yml`;

  // 1. Generate frontend docs
  console.info("Generating frontend documentation...");
  await runLive("node", ["docs/scripts/generate-frontend-docs.mjs"]);
  console.info("Frontend documentation generated.");

  // 2. Start database, backend, frontend in background (live output)
  console.info("Starting database, backend, and frontend services...");
  runLive("docker", [
    "compose",
    "-f",
    composeFile,
    "up",
    "--build",
    "-d",
    "database",
    "backend",
    "frontend",
  ]);

  // 3. Wait for backend service to be healthy
  console.info("Waiting for backend service to be healthy...");
  const backendContainerName = await getContainerName("backend", composeFile);
  await waitForHealthy(backendContainerName);
  console.info("Backend service is healthy.");

  // 4. Generate the api documentation, but only if not in dev mode as it will already be generated live there after building
  if (env !== "dev") {
    console.info("Starting API documentation generation service...");
    await runLive("docker", [
      "compose",
      "-f",
      composeFile,
      "run",
      "--rm",
      "--build",
      "api-docs-generator",
    ]);
    console.info("API documentation generation is completed.");
  }

  // 4. Generate backend docs
  console.info("Generating backend documentation...");
  await runLive("node", ["docs/scripts/generate-backend-docs.js"]);
  console.info("Backend documentation generated.");

  // 5. Start docs container (live output)
  console.info("Starting documentation service...");
  await runLive("docker", [
    "compose",
    "-f",
    composeFile,
    "up",
    "--build",
    "-d",
    "docs",
  ]);
  console.info("Documentation service started.");

  console.info("All services are running.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
