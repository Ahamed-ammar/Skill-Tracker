import "dotenv/config";
import express from "express";
import cors from "cors";
import { initDb } from "./db/database.js";

// ── Routers ───────────────────────────────────────────────────────────────────
import authRouter from "./routes/auth.js";
import resumeRouter from "./routes/resume.js";
import jobRouter from "./routes/job.js";
import analysisRouter from "./routes/analysis.js";
import jobsSearchRouter from "./routes/jobsSearch.js";
import studyPlansRouter from "./routes/studyPlans.js";

// ── App ───────────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 8000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Request Logger ────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] → ${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/job", jobRouter);
app.use("/api/analyze", analysisRouter);
app.use("/api/jobs", jobsSearchRouter);
app.use("/api/study-plans", studyPlansRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ detail: "Not Found" });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err.message || err);
  res
    .status(err.status || 500)
    .json({ detail: err.message || "Internal Server Error" });
});

// ── Startup ───────────────────────────────────────────────────────────────────
async function start() {
  console.log("Starting Curator AI Express backend...");

  try {
    await initDb();
    console.log("✅ Database tables ready");
  } catch (e) {
    console.warn("⚠️  DB init skipped:", e.message);
  }

  app.listen(PORT, () => {
    console.log(`✅ Server ready — http://localhost:${PORT}`);
    console.log(`   Docs: http://localhost:${PORT}/health`);
  });
}

start();
