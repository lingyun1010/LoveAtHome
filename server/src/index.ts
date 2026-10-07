import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { enquiriesRouter } from "./routes/enquiries.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
const app = express();
const port = Number(process.env.PORT) || 3001;
app.disable("x-powered-by");
app.use(cors({ origin: process.env.NODE_ENV === "production" ? false : "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/enquiries", enquiriesRouter);

const dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(dirname, "public");
if (process.env.NODE_ENV === "production") {
  app.use(express.static(publicDir));
  app.get("*", (_req, res) => res.sendFile(path.join(publicDir, "index.html")));
}

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ success: false, message: "Unexpected server error." });
});

app.listen(port, () => console.log(`Love At Home server running at http://localhost:${port}`));
