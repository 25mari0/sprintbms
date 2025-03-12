import { Request } from 'express';

function getAccessTokenFromCookie(req: Request): string | undefined {
  return req.cookies ? req.cookies.accessToken : undefined;

}

function getRefreshTokenFromCookie(req: Request): string | undefined {
  return req.cookies ? req.cookies.refreshToken : undefined;
}

export { getAccessTokenFromCookie, getRefreshTokenFromCookie };

