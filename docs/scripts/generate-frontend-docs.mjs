import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const frontendDir = path.resolve(__dirname, "../../frontend");
const typedocOutDir = path.resolve(__dirname, "../typedoc-files");
const finalDocsDir = path.resolve(__dirname, "../content/docs/Frontend");

console.log("✅ Step 1: Generating TypeDoc...");
await fs.rm(typedocOutDir, { recursive: true, force: true });
await new Promise((resolve, reject) => {
    exec("npx typedoc", { cwd: frontendDir }, (err, stdout, stderr) => {
        if (err) {
            console.error("❌ TypeDoc error:", stderr);
            return reject(err);
        }
        console.log(stdout);
        resolve();
    });
});

// Recursive conversion from .md -> .mdx + linkfix
async function convertMarkdownToMdx(srcDir, destDir) {
    const entries = await fs.readdir(srcDir, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(srcDir, entry.name);
        const isMd = entry.isFile() && entry.name.endsWith(".md");

        if (entry.isDirectory()) {
            await convertMarkdownToMdx(srcPath, path.join(destDir, entry.name));
        } else if (isMd) {
            const rawName =
                entry.name === "README.md"
                    ? path.basename(srcDir) === "typedoc-files"
                        ? "Frontend"
                        : path.basename(srcDir)
                    : entry.name.replace(".md", "");
            const title = rawName
                ? rawName.charAt(0).toUpperCase() + rawName.slice(1)
                : "Untitled";

            let content = await fs.readFile(srcPath, "utf-8");

            content = content
                .replace(/\]\(([^)]+)\.md\)/g, "]($1)") // Remove .md from links
                .replace(/\/README(?:\.md)?/g, "") // Remove /README.md from links
                .replace(/\/\(([^)]+)\)/g, "/$1"); // Fix links with parentheses

            // Convert code blocks to CodeBlock components
            content = content.replace(
                /```(\w+)\n([\s\S]*?)```/g,
                (_match, lang, code) => {
                    // Escape backticks binnenin code
                    const escapedCode = code.replace(/`/g, "\\`");

                    return `<CodeBlock language="${lang}">
{ \`${escapedCode}\` }
</CodeBlock>`;
                },
            );

            // Convert function signatures to CodeBlock
            content = content.replace(
                /^>\s*\*\*(\w+)\*\*\(([^)]*)\):\s*(.+)$/gm,
                (_match, funcName, params, returnTypeRaw) => {
                    // Remove inline backticks
                    const cleanReturnType = returnTypeRaw.replace(/`/g, "");

                    // Remove backticks from params as well (just in case)
                    const cleanParams = params.replace(/`/g, "");

                    const code = `function ${funcName}(${cleanParams}): ${cleanReturnType}`;

                    return `<CodeBlock language="ts">
{ \`${code}\` }
</CodeBlock>`;
                },
            );

            // Convert type alias definitions with generics to CodeBlock
            content = content.replace(
                /^>\s*\*\*(\w+)\*\*\\<`?([^>`\s]+)`?\\>\s*=\s*`([^`]+)`/gm,
                (_match, aliasName, typeParam, typeValue) => {
                    const code = `type ${aliasName}<${typeParam}> = ${typeValue}`;
                    return `<CodeBlock language="ts">
{\`${code}\`}
</CodeBlock>`;
                },
            );

            // Convert type alias declarations to CodeBlock
            content = content.replace(
                /^>\s*\*\*(\w+)\*\*\s*=\s*(.+)$/gm,
                (_match, typeName, typeRaw) => {
                    let cleanType = typeRaw
                        .replace(/`/g, "") // remove inline backticks
                        .replace(/\*([^*]+)\*/g, "$1") // remove *italic* markers
                        .trim();

                    const code = `type ${typeName} = ${cleanType}`;

                    return `<CodeBlock language="ts">
{\`${code}\`}
</CodeBlock>`;
                },
            );

            // Convert const declarations with types to CodeBlock
            content = content.replace(
                /^>\s*`const`\s+\*\*(\w+)\*\*:\s+(.+)$/gm,
                (_match, constName, typeRaw) => {
                    let cleanType = typeRaw
                        .replace(/`/g, "") // Remove backticks
                        .replace(/\*([^*]+)\*/g, "$1") // Remove *italic* from typeof etc.
                        .trim();

                    const code = `const ${constName}: ${cleanType}`;

                    return `<CodeBlock language="ts">
{\`${code}\`}
</CodeBlock>`;
                },
            );

            // Convert inline code blocks to CodeBlock components
            content = content.replace(
                /^((?:\s*)`[^`\n]+`(?:<[^`]*>)?(?:\s*))+$/gm,
                (match) => {
                    // Strip backticks
                    const cleaned = match.replace(/`/g, "").trim();

                    return `<CodeBlock language="ts">
{\`${cleaned}\`}
</CodeBlock>`;
                },
            );

            // Convert interface properties (including optional ones) to CodeBlock
            content = content.replace(
                /^>\s*(?:`optional`\s*)?\*\*(\w+)\*\*:\s+(.+)$/gm,
                (_match, propName, typeRaw) => {
                    let cleanType = typeRaw
                        .replace(/`/g, "") // remove backticks
                        .replace(/\*([^*]+)\*/g, "$1") // remove italics
                        .trim();

                    const isOptional = /`optional`/.test(_match);
                    const name = isOptional ? `${propName}?` : propName;

                    const code = `${name}: ${cleanType}`;

                    return `<CodeBlock language="ts">
{\`${code}\`}
</CodeBlock>`;
                },
            );

            // Convert inline code blocks with links to CodeBlock components
            content = content.replace(/^((\s*)`[^`\n]+`.*)+$/gm, (line) => {
                // Strip backticks
                const cleaned = line.replace(/`/g, "").trim();

                // Wrap in CodeBlock
                return `<CodeBlock language="ts">
{\`${cleaned}\`}
</CodeBlock>`;
            });

            // Convert blockquotes to styled divs
            content = content.replace(/^>?\s*Note:(.*)$/gm, (_, noteText) => {
                return `
<div className="my-4 p-4 border-l-4 border-blue-400 bg-blue-50 text-blue-800 rounded-md">
  💡${noteText.trim()}
</div>`;
            });

            // Convert warnings to styled divs
            content = content.replace(
                /^>?\s*Warning:(.*)$/gm,
                (_, warnText) => {
                    return `  
<div className="my-4 p-4 border-l-4 border-red-400 bg-red-50 text-red-800 rounded-md">
  🚨${warnText.trim()}
</div>`;
                },
            );

            // Add import statement for CodeBlock if it contains <CodeBlock>
            const importCodeBlock = `import { CodeBlock } from '@/components/code-block'\n\n`;
            if (content.includes("<CodeBlock")) {
                content = importCodeBlock + content;
            }

            // replace folder links with [...something] to something
            content = content.replace(/\/\[\.\.\.(.+?)\]/g, "/$1");

            const frontmatter = `---\ntitle: ${title}\nsidebar_position: 1\n---\n\n`;

            const destName = entry.name
                .replace(".md", ".mdx")
                .replace("README.mdx", "index.mdx");

            // Fix links to point to the correct file if it is an index file (as an index file hasn't his name in the path already)
            if (destName === "index.mdx") {
                content = content
                    .replace(/\(([^()\/]+\/)/g, `(./${rawName}/$1`) // Add title to links
                    .replace(/\[\.\.\.(.+?)\]/g, "$1"); // Remove [...something] from links
            }

            const destPath = path
                .join(destDir, destName)
                .replace(/\/\(([^)]+)\)/g, "/$1")
                .replace(/\\\(([^)]+)\)/g, "\\$1")
                .replace(/\[\.\.\.(.+?)\]/g, "$1");

            await fs.mkdir(path.dirname(destPath), { recursive: true });
            await fs.writeFile(destPath, frontmatter + content, "utf-8");
        }
    }
}

console.log("✅ Step 2: Convert all .md files to .mdx...");
await fs.rm(finalDocsDir, { recursive: true, force: true });
await convertMarkdownToMdx(typedocOutDir, finalDocsDir);

console.log("🎉 Done! Result files can be found in:", finalDocsDir);
