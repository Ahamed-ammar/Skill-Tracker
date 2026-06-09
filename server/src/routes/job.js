import { Router } from "express";
import { body, validationResult } from "express-validator";
import { extractJobSkills } from "../services/jobParser.js";

const router = Router();

// ── POST /api/job/parse ───────────────────────────────────────────────────────
router.post(
  "/parse",
  [body("job_text").trim().notEmpty().withMessage("job_text cannot be empty.")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ detail: errors.array().map((e) => e.msg).join(", ") });
      }

      const { job_text } = req.body;

      try {
        const result = await extractJobSkills(job_text);
        return res.json(result);
      } catch (e) {
        return res
          .status(500)
          .json({ detail: `Job parsing failed: ${e.message}` });
      }
    } catch (err) {
      next(err);
    }
  }
);

export default router;
