import { build } from "esbuild";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { createHash } from "crypto";

const isWatch = process.argv.includes("--watch");

// Ensure dist directory exists
if (!existsSync("./dist")) {
    mkdirSync("./dist", { recursive: true });
}

const buildConfig = {
    entryPoints: ["./src/index.ts"],
    outfile: "./dist/index.js",
    bundle: true,
    minify: true,
    sourcemap: false,
    format: "cjs",
    target: ["es2020"],
    external: [
        "@vendetta/metro",
        "@vendetta/patcher",
        "@vendetta/plugin",
        "@vendetta/ui",
        "@vendetta/storage",
    ],
    define: {
        "process.env.NODE_ENV": '"production"',
    },
    logLevel: "info",
};

async function buildPlugin() {
    try {
        console.log("Building CCVibe Mobile Plugin...");

        await build(buildConfig);

        // Generate hash for manifest
        const bundleContent = readFileSync("./dist/index.js", "utf-8");
        const hash = createHash("sha256").update(bundleContent).digest("hex");

        // Update manifest with hash
        const manifest = JSON.parse(readFileSync("./manifest.json", "utf-8"));
        manifest.hash = hash;
        writeFileSync("./manifest.json", JSON.stringify(manifest, null, 4));

        console.log(`Build complete! Hash: ${hash.substring(0, 16)}...`);
        console.log("Output: ./dist/index.js");

    } catch (error) {
        console.error("Build failed:", error);
        process.exit(1);
    }
}

if (isWatch) {
    console.log("Starting watch mode...");
    build({
        ...buildConfig,
        watch: {
            onRebuild(error) {
                if (error) {
                    console.error("Rebuild failed:", error);
                } else {
                    console.log("Rebuilt successfully!");
                }
            },
        },
    });
} else {
    buildPlugin();
}
