import { Router } from "express";
import { authenticateToken } from "./auth.js";
import { getStudyPlans, getStudyPlan } from "../db/database.js";

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

export default router;
