//
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const getAccessSecret = () => process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const getAccessExpiresIn = () => process.env.JWT_ACCESS_EXPIRES_IN || "15m";

const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
const getRefreshExpiresIn = () => process.env.JWT_REFRESH_EXPIRES_IN || "7d";

const generateAccessToken = (payload) => {
  return jwt.sign(
    { ...payload, tokenType: 'access', jti: crypto.randomBytes(16).toString('hex') },
    getAccessSecret(),
    { expiresIn: getAccessExpiresIn() }
  );
};

const generateRefreshToken = (payload) => {
  return jwt.sign(
    { ...payload, tokenType: 'refresh', jti: crypto.randomBytes(16).toString('hex') },
    getRefreshSecret(),
    { expiresIn: getRefreshExpiresIn() }
  );
};


const verifyAccessToken = (token) => {
  return jwt.verify(token, getAccessSecret());
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, getRefreshSecret());
};

const hashRefreshToken = (refreshToken) => {
  if (!refreshToken) return null;
  return crypto.createHash("sha256").update(refreshToken).digest("hex");
};

// Legacy backward compatibility alias
const generateToken = (payload) => generateAccessToken(payload);
const verifyToken = (token) => verifyAccessToken(token);

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashRefreshToken,
  generateToken,
  verifyToken,
};

