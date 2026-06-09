import { Router } from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken } from "./auth.js";
import { extractResumeSkills } from "../services/skillExtractor.js";
import { extractJobSkills } from "../services/jobParser.js";
import { computeMatchScore } from "../services/matchingEngine.js";
import { findSkillGaps } from "../services/gapAnalyzer.js";
import { generateRoadmap } from "../services/mentorAgent.js";
import { saveStudyPlan } from "../db/database.js";

const router = Router();

// ── POST /api/analyze/full ────────────────────────────────────────────────────
router.post(
  "/full",
  authenticateToken,
  [
    body("resume_text")
      .trim()
      .notEmpty()
      .withMessage("resume_text cannot be empty."),
    body("job_text").trim().notEmpty().withMessage("job_text cannot be empty."),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ detail: errors.array().map((e) => e.msg).join(", ") });
      }

      const { resume_text, job_text } = req.body;
      console.log(
        `[analysis] full_analysis: resume=${resume_text.length} chars  job=${job_text.length} chars`
      );

      let resume_skills = [];
      let job_skills = [];
      let job_title = "";
      let match_score = 0;
      let gaps = [];
      let roadmap = [];

      try {
        // 1 — extract resume skills
        console.log("  [1/5] extracting resume skills…");
        const resumeData = await extractResumeSkills(resume_text);
        resume_skills = [...resumeData.skills, ...resumeData.tools];
        console.log(
          `  [1/5] found ${resume_skills.length} resume skills:`,
          resume_skills
        );

        // 2 — extract job skills
        console.log("  [2/5] extracting job skills…");
        const jobData = await extractJobSkills(job_text);
        job_skills = jobData.required_skills || [];
        job_title = jobData.job_title || "";
        console.log(
          `  [2/5] found ${job_skills.length} job skills:`,
          job_skills,
          `title='${job_title}'`
        );

        // 3 — match score
        console.log("  [3/5] computing match score…");
        match_score = computeMatchScore(resume_skills, job_skills);
        console.log(`  [3/5] match score = ${match_score}%`);

        // 4 — skill gaps
        console.log("  [4/5] finding skill gaps…");
        gaps = await findSkillGaps(resume_skills, job_skills);
        console.log(
          `  [4/5] ${gaps.length} gaps:`,
          gaps.map((g) => g.skill)
        );

        // 5 — roadmap
        console.log("  [5/5] generating roadmap…");
        roadmap = await generateRoadmap(gaps.map((g) => g.skill));
        console.log(`  [5/5] roadmap has ${roadmap.length} entries`);
      } catch (e) {
        console.error("[analysis] pipeline failed:", e);
        return res.status(500).json({ detail: `Analysis failed: ${e.message}` });
      }

      // Persist (non-blocking)
      let plan_id = -1;
      try {
        const plan_name = job_title ? `${job_title} Plan` : "Study Plan";
        plan_id = await saveStudyPlan(
          req.user.id,
          plan_name,
          match_score,
          resume_skills,
          job_skills,
          gaps,
          roadmap
        );
        console.log(`[analysis] saved study plan id=${plan_id}`);
      } catch (e) {
        console.warn(`[analysis] DB save failed (non-fatal): ${e.message}`);
      }

      console.log("[analysis] done ✅");
      return res.json({
        match_score,
        resume_skills,
        job_skills,
        job_title,
        skill_gaps: gaps,
        roadmap,
        plan_id,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
