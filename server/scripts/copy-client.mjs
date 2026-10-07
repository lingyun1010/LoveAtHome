import { access, cp, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientDist = path.resolve(serverDir, "../client/dist");
const publicDir = path.resolve(serverDir, "dist/public");

await access(path.join(clientDist, "index.html"));
await rm(publicDir, { recursive: true, force: true });
await cp(clientDist, publicDir, { recursive: true });
