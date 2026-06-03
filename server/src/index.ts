import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env.local") });
dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../../.env") });
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config();

import cors from "cors";
import express from "express";
import { getPool } from "./db.js";
import { analyticsRouter } from "./routes/analytics.js";
import { healthRouter } from "./routes/health.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await getPool().query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

app.use("/api/data-health", healthRouter);
app.use("/api/analytics", analyticsRouter);

const clientDist = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ error: message });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
