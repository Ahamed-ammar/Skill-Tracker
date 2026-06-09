import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "change-me-in-production";
const ALGORITHM = "HS256";
const ACCESS_TOKEN_EXPIRE_HOURS = 24;

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(plain, hashed) {
  return bcrypt.compareSync(plain, hashed);
}

export function createAccessToken(userId, email) {
  const payload = { sub: String(userId), email };
  return jwt.sign(payload, SECRET_KEY, {
    algorithm: ALGORITHM,
    expiresIn: `${ACCESS_TOKEN_EXPIRE_HOURS}h`,
  });
}

export function decodeToken(token) {
  // Throws JsonWebTokenError / TokenExpiredError on failure
  return jwt.verify(token, SECRET_KEY, { algorithms: [ALGORITHM] });
}
