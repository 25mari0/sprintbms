import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/authTypes';
import authService from '../services/auth.service';
import {
  getAccessTokenFromHeader,
  getRefreshTokenFromCookie,
} from '../utils/auth';

export const tokenMiddleware = {
  authenticate: async (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const accessToken = getAccessTokenFromHeader(req);
      if (!accessToken) {
        throw new Error('No token provided');
      }

      const decoded = jwt.verify(
        accessToken,
        process.env.JWT_SECRET!,
      ) as JwtPayload;
      const user = await authService.getUserById(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (
        user.lastPasswordChange &&
        user.lastPasswordChange.getTime() > decoded.iat * 1000
      ) {
        throw new Error('Token is no longer valid');
      }

      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        // access token is expired but was otherwise valid
        const refreshToken = getRefreshTokenFromCookie(req);
        if (!refreshToken) {
          throw new Error('No refresh token provided');
        }

        try {
          // Validate refresh token and generate new access token
          const { accessToken } =
            await authService.refreshAccessToken(refreshToken);
          res.setHeader('Authorization', `Bearer ${accessToken}`);
          const newDecoded = jwt.verify(
            accessToken,
            process.env.JWT_SECRET!,
          ) as JwtPayload; // Ensure this matches JwtPayload type

          req.user = newDecoded;
          next();
        } catch {
          // refresh token is invalid or there was an error in the process
          throw new Error('Failed to refresh access token');
        }
      } else {
        // token is invalid for reasons other than expiration (e.g., tampered, wrong signature)
        const err = error as Error;
        err.message = `The token is invalid: ${err.message}`;
        next(err);
      }
    }
  },
};

export default tokenMiddleware;
