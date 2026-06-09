import pkg from "pg";
const { Pool } = pkg;

let pool = null;

// ── Build pool ─────────────────────────────────────────────────────────────────
function buildPool() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.warn("[DB] DATABASE_URL not set — DB persistence disabled");
    return null;
  }

  return new Pool({
    connectionString: url,
    ssl: url.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : false,
  });
}

pool = buildPool();

// ── Init tables ────────────────────────────────────────────────────────────────
export async function initDb() {
  if (!pool) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      hashed_password VARCHAR(255) NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at VARCHAR(32) NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS analysis_sessions (
      id SERIAL PRIMARY KEY,
      match_score FLOAT NOT NULL,
      resume_skills TEXT NOT NULL,
      job_skills TEXT NOT NULL,
      skill_gaps TEXT NOT NULL,
      roadmap TEXT NOT NULL,
      created_at VARCHAR(32) NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS study_plans (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      name VARCHAR(255) NOT NULL,
      match_score FLOAT NOT NULL,
      resume_skills TEXT NOT NULL,
      job_skills TEXT NOT NULL,
      skill_gaps TEXT NOT NULL,
      roadmap TEXT NOT NULL,
      created_at VARCHAR(32) NOT NULL
    )
  `);

  console.log("[DB] tables ready");
}

// ── User CRUD ──────────────────────────────────────────────────────────────────
export async function createUser(email, hashedPassword) {
  if (!pool) throw new Error("Database not configured");
  const now = new Date().toISOString();
  const { rows } = await pool.query(
    `INSERT INTO users (email, hashed_password, created_at)
     VALUES ($1, $2, $3) RETURNING *`,
    [email, hashedPassword, now]
  );
  return rows[0];
}

export async function getUserByEmail(email) {
  if (!pool) return null;
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE email = $1 LIMIT 1",
    [email]
  );
  return rows[0] || null;
}

export async function getUserById(id) {
  if (!pool) return null;
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE id = $1 LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

// ── Analysis session CRUD ──────────────────────────────────────────────────────
export async function saveSession(matchScore, resumeSkills, jobSkills, skillGaps, roadmap) {
  if (!pool) return -1;
  const now = new Date().toISOString();
  const { rows } = await pool.query(
    `INSERT INTO analysis_sessions
       (match_score, resume_skills, job_skills, skill_gaps, roadmap, created_at)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [
      matchScore,
      JSON.stringify(resumeSkills),
      JSON.stringify(jobSkills),
      JSON.stringify(skillGaps),
      JSON.stringify(roadmap),
      now,
    ]
  );
  return rows[0].id;
}

// ── Study plan CRUD ────────────────────────────────────────────────────────────
export async function saveStudyPlan(userId, name, matchScore, resumeSkills, jobSkills, skillGaps, roadmap) {
  if (!pool) return -1;
  const now = new Date().toISOString();
  const { rows } = await pool.query(
    `INSERT INTO study_plans
       (user_id, name, match_score, resume_skills, job_skills, skill_gaps, roadmap, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [
      userId,
      name,
      matchScore,
      JSON.stringify(resumeSkills),
      JSON.stringify(jobSkills),
      JSON.stringify(skillGaps),
      JSON.stringify(roadmap),
      now,
    ]
  );
  return rows[0].id;
}

export async function getStudyPlans(userId) {
  if (!pool) return [];
  const { rows } = await pool.query(
    `SELECT id, name, created_at FROM study_plans
     WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

export async function getStudyPlan(planId, userId) {
  if (!pool) return null;
  const { rows } = await pool.query(
    "SELECT * FROM study_plans WHERE id = $1 LIMIT 1",
    [planId]
  );
  const record = rows[0];
  if (!record) return null;
  if (record.user_id !== userId) return { _forbidden: true };
  return {
    id: record.id,
    name: record.name,
    match_score: record.match_score,
    resume_skills: JSON.parse(record.resume_skills),
    job_skills: JSON.parse(record.job_skills),
    skill_gaps: JSON.parse(record.skill_gaps),
    roadmap: JSON.parse(record.roadmap),
    created_at: record.created_at,
  };
}
