import { Router } from "express";
import { authenticateToken } from "./auth.js";
import { getStudyPlans, getStudyPlan, saveStudyPlan } from "../db/database.js";
import { generateRoadmap } from "../services/mentorAgent.js";

const router = Router();

// ── GET /api/study-plans ──────────────────────────────────────────────────────
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const plans = await getStudyPlans(req.user.id);
    res.json(plans);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/study-plans/:plan_id ─────────────────────────────────────────────
router.get("/:plan_id", authenticateToken, async (req, res, next) => {
  try {
    const planId = parseInt(req.params.plan_id, 10);
    if (isNaN(planId)) {
      return res.status(400).json({ detail: "Invalid plan ID" });
    }

    const result = await getStudyPlan(planId, req.user.id);

    if (!result) {
      return res.status(404).json({ detail: "Study plan not found" });
    }
    if (result._forbidden) {
      return res.status(403).json({ detail: "Access denied" });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/study-plans/generate ────────────────────────────────────────────
router.post("/generate", authenticateToken, async (req, res, next) => {
  try {
    const { match_score, resume_skills, job_skills, job_title, skill_gaps } = req.body;
    
    if (!skill_gaps || !Array.isArray(skill_gaps)) {
      return res.status(400).json({ detail: "skill_gaps array is required" });
    }

    console.log(`[studyPlans] generating roadmap for ${skill_gaps.length} gaps...`);
    const roadmap = await generateRoadmap(skill_gaps.map((g) => g.skill));

    const plan_name = job_title ? `${job_title} Plan` : "Study Plan";
    const plan_id = await saveStudyPlan(
      req.user.id,
      plan_name,
      match_score || 0,
      resume_skills || [],
      job_skills || [],
      skill_gaps,
      roadmap
    );

    console.log(`[studyPlans] generated and saved plan id=${plan_id}`);
    res.json({ plan_id, roadmap });
  } catch (err) {
    next(err);
  }
});

export default router;
