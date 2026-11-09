import { randomUUID } from 'crypto';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

interface TokenPayload {
  userId: string;
  email: string;
  accountType: string;
}

export function generateTokens(payload: TokenPayload) {
  const accessSecret: Secret = env.JWT_ACCESS_SECRET;
  const refreshSecret: Secret = env.JWT_REFRESH_SECRET;

  const accessOptions: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  };

  // A unique ID keeps two logins in the same second from producing the same token,
  // which would let revoking one session also revoke the other.
  const refreshOptions: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
    jwtid: randomUUID(),
  };

  const accessToken = jwt.sign(payload, accessSecret, accessOptions);
  const refreshToken = jwt.sign(payload, refreshSecret, refreshOptions);

  return { accessToken, refreshToken };
}
