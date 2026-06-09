import { Router } from "express";
import { body, validationResult } from "express-validator";
import { createUser, getUserByEmail, getUserById } from "../db/database.js";
import {
  hashPassword,
  verifyPassword,
  createAccessToken,
  decodeToken,
} from "../services/authService.js";

const router = Router();

// ── Middleware: get current user ──────────────────────────────────────────────
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ detail: "Not authenticated" });
  }

  try {
    const payload = decodeToken(token);
    const userId = parseInt(payload.sub, 10);
    const user = await getUserById(userId);

    if (!user || !user.is_active) {
      return res.status(401).json({ detail: "User not found or inactive" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    };
    next();
  } catch (err) {
    return res.status(401).json({ detail: "Invalid or expired token" });
  }
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ detail: errors.array().map((e) => e.msg).join(", ") });
      }

      const { email, password } = req.body;

      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ detail: "Email already registered" });
      }

      const user = await createUser(email, hashPassword(password));
      console.log(`[auth] register: new user id=${user.id} email=${user.email}`);

      const token = createAccessToken(user.id, user.email);
      res.status(201).json({ access_token: token, token_type: "bearer" });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").exists(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ detail: "Invalid email or password" });
      }

      const { email, password } = req.body;

      const user = await getUserByEmail(email);
      if (!user || !verifyPassword(password, user.hashed_password)) {
        return res.status(401).json({ detail: "Invalid email or password" });
      }

      console.log(`[auth] login: user id=${user.id} email=${user.email}`);

      const token = createAccessToken(user.id, user.email);
      res.json({ access_token: token, token_type: "bearer" });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get("/me", authenticateToken, (req, res) => {
  res.json(req.user);
});

export default router;
