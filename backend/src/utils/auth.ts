import { Request } from 'express';

function getAccessTokenFromHeader(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  return authHeader && authHeader.split(' ')[1];
}

function getRefreshTokenFromCookie(req: Request): string | undefined {
  return req.cookies ? req.cookies.refreshToken : undefined;
}

export { getAccessTokenFromHeader, getRefreshTokenFromCookie };
