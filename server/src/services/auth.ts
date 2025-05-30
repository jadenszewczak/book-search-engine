import jwt from 'jsonwebtoken';
import type { Request } from 'express';
import dotenv from 'dotenv';
dotenv.config();

interface JwtPayload {
  _id: string;
  username: string;
  email: string;
}

export const authenticateToken = ({ req }: { req: Request }) => {
  let token = req.body.token || req.query.token || req.headers.authorization;

  if (req.headers.authorization) {
    token = token.split(' ').pop().trim();
  }

  if (!token) {
    return req;
  }

  try {
    const secretKey = process.env.JWT_SECRET_KEY || '';
    const { data } = jwt.verify(token, secretKey, { maxAge: '2h' }) as { data: JwtPayload };
    req.user = data;
  } catch {
    console.log('Invalid token');
  }

  return req;
};

export const signToken = (username: string, email: string, _id: string | unknown) => {
  const payload = { username, email, _id: String(_id) };
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign({ data: payload }, secretKey, { expiresIn: '2h' });
};