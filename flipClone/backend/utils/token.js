import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

//ACCESS TOKEN
const generateAccessToken = (payload, expiresIn = '15m') => {
  if (!JWT_ACCESS_SECRET) {
    throw new Error('JWT_SECRET is missing in env');
  }

  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn });
};

//REFRESH TOKEN
const generateRefreshToken = (payload, expiresIn = '7d') => {
  if (!JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is missing in env');
  }

  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn });
};

// TOKEN
const generateToken = (payload, expiresIn = '1h') => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export {
    generateAccessToken,
    generateRefreshToken,
    generateToken,
}
