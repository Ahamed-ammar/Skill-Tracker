import { Router } from "express";
import fetch from "node-fetch";

const router = Router();
const RAPID_API_KEY = process.env.RAPID_API_KEY || "";
const RAPID_API_HOST = "jsearch.p.rapidapi.com";

// ── GET /api/jobs/search ──────────────────────────────────────────────────────
router.get("/search", async (req, res, next) => {
  try {
    const query = req.query.query || "";
    const location = req.query.location || "";
    const page = parseInt(req.query.page, 10) || 1;

    if (!query) {
      return res.status(400).json({ detail: "query parameter is required" });
    }
    if (!RAPID_API_KEY) {
      return res.status(500).json({ detail: "RAPID_API_KEY not set in .env" });
    }

    const searchQuery = `${query} ${location}`.trim();
    console.log(`[jobsSearch] query='${searchQuery}' page=${page}`);

    const params = new URLSearchParams({
      query: searchQuery,
      page: String(page),
      num_pages: "1",
      date_posted: "all",
    });

    try {
      const response = await fetch(`https://${RAPID_API_HOST}/search?${params}`, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": RAPID_API_KEY,
          "X-RapidAPI-Host": RAPID_API_HOST,
        },
      });

      if (!response.ok) {
        console.error(`[jobsSearch] RapidAPI error: ${response.status}`);
        return res
          .status(502)
          .json({ detail: `Job search API error: ${response.status}` });
      }

      const data = await response.json();
      const rawJobs = data.data || [];
      console.log(`[jobsSearch] got ${rawJobs.length} results`);

      // Simplify to what the frontend needs
      const jobs = rawJobs.map((j) => ({
        id: j.job_id || "",
        title: j.job_title || "",
        company: j.employer_name || "",
        location: j.job_city || j.job_country || "Remote",
        type: j.job_employment_type || "",
        posted: j.job_posted_at_datetime_utc || "",
        description: (j.job_description || "").slice(0, 500),
        url: j.job_apply_link || j.job_google_link || "",
        logo: j.employer_logo || "",
      }));

      return res.json({ jobs, total: jobs.length, page });
    } catch (apiError) {
      console.error(`[jobsSearch] request failed: ${apiError.message}`);
      return res.status(502).json({ detail: "Could not reach job search API" });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
