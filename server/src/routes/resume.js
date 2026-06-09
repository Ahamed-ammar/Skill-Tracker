import { Router } from "express";
import multer from "multer";
import { parseResume } from "../services/resumeParser.js";

const router = Router();

// Use memory storage for parsing in-memory (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ── POST /api/resume/upload ───────────────────────────────────────────────────
router.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    console.log(
      `[resume] upload_resume: content-type=${req.headers["content-type"]}`
    );

    if (!req.file) {
      console.error("[resume] no 'file' field or file too large");
      return res
        .status(400)
        .json({ detail: "No file provided under the 'file' field." });
    }

    const { originalname, buffer } = req.file;
    console.log(`[resume] upload_resume: filename=${originalname}`);

    if (buffer.length === 0) {
      return res.status(400).json({ detail: "Uploaded file is empty." });
    }

    try {
      const resumeText = await parseResume(buffer, originalname);
      return res.json({ resume_text: resumeText });
    } catch (parseError) {
      console.error("[resume] upload_resume: parse failed —", parseError.message);
      // Map validation errors from the parser to 422
      return res.status(422).json({ detail: parseError.message });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
