import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/express';
import authService from '../services/auth.service';


function getTokenFromHeader(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  return authHeader && authHeader.split(' ')[1];
};

function getRefreshTokenFromCookie(req: Request): string | undefined {
  return req.cookies ? req.cookies.refreshToken : undefined;
};

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & { iat: number };
    const user = await authService.getUserById(decoded.userId);

    if (!user) {
      res.status(401).json({ message: 'Invalid user' });
      return;
    }

    // Check if password was changed after token was issued
    if (user.lastPasswordChange && user.lastPasswordChange.getTime() > (decoded.iat * 1000)) {
      res.status(401).json({ message: 'Token is invalid due to password change' });
    }

    req.user = decoded;
    next();

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {

      // access token is expired but was otherwise valid
      const refreshToken = getRefreshTokenFromCookie(req);
      if (!refreshToken) {
        res.status(401).json({ message: 'No refresh token provided' });
        return;
      }

      try {
        // Validate refresh token and generate new access token
        const { accessToken } = await authService.refreshAccessToken(refreshToken);
        res.setHeader('Authorization', `Bearer ${accessToken}`);
        const newDecoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as JwtPayload;
        req.user = newDecoded;
        next();
      } catch {
        // refresh token is invalid or there was an error in the process
        res.status(401).json({ message: 'Failed to refresh token' });
      }

    } else {
      
      // token is invalid for reasons other than expiration (e.g., tampered, wrong signature)
      res.status(401).json({ message: 'Invalid token' });
    }
  }

};

