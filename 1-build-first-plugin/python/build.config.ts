import { build, createServer, InlineConfig } from "vite";
import { rimrafSync } from "rimraf";
import { viteSingleFile } from "vite-plugin-singlefile";
import { parseArgs } from "util";
import chokidar from "chokidar";
import { zip } from "zip-a-folder";
import fs from "fs";
import path from "path";

const REQUIREMENTS_PATH = "requirements.txt";
const patchManifestWithPython = () => {
  const manifestPath = path.resolve("metadata", "manifest.json");
  const requirementsPath = path.resolve(REQUIREMENTS_PATH);

  const pythonPackages = fs.readFileSync(requirementsPath)
    .toString()
    .split("\n")
    .filter((pkg) => pkg.length > 0);

  const manifestContent = fs.readFileSync(manifestPath, "utf-8");
  const manifest = JSON.parse(manifestContent);

  manifest.python = manifest.python ?? {};
  manifest.python.packages = pythonPackages;

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
}

const {
  values: { dev: isDev }
} = parseArgs({
  args: process.argv,
  options: {
    dev: {
      type: "boolean"
    },
    build: {
      type: "boolean"
    }
  },
  allowPositionals: true
});

const panelConfig: InlineConfig = {
  root: "./src/panel",
  publicDir: "../../metadata",
  build: {
    outDir: "../../dist",
    emptyOutDir: false
  },
  plugins: [
    viteSingleFile(),
    {
      name: "configure-response-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Access-Control-Request-Private-Network", "true");
          res.setHeader("Access-Control-Allow-Private-Network", "true");
          res.setHeader("Access-Control-Expose-Headers", "ETag");
          next();
        });
      }
    }
  ],
  server: {
    port: 8888,
    cors: {
      origin: [
        "https://qatium.app",
        "http://localhost:8888",
        "http://localhost:3000",
        "null"
      ],
      credentials: true,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      optionsSuccessStatus: 204
    }
  }
};

const pluginDirectory = "src/plugin";
const watchPython = (changed: (path: string) => void) => {
  const watcher = chokidar.watch([pluginDirectory, REQUIREMENTS_PATH], {
    persistent: true
  });

  watcher.on("all", (_, path) => {
    changed(path);
  });
}

const pythonZip = "metadata/plugin.zip";
const buildPython = async (path?: string) => {
  console.log("Bundling python code...")
  if (path?.includes(REQUIREMENTS_PATH)) {
    return patchManifestWithPython();
  }
  if (fs.existsSync(pythonZip)) {
    fs.unlinkSync(pythonZip)
  }

  await zip(pluginDirectory, pythonZip);
}

(async () => {
  rimrafSync("./dist");

  await new Promise((resolve) => setTimeout(() => resolve(true), 1000));

  if (isDev) {
    await buildPython();
    watchPython(buildPython);
    const server = await createServer(panelConfig);

    await server.listen();
    server.printUrls();
    server.bindCLIShortcuts({ print: true });
  } else {
    await buildPython();
    await build(panelConfig);
  }
})();
