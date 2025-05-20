import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/authTypes';
import authService from '../services/auth.service';
import { getRefreshTokenFromCookie, getAccessTokenFromCookie } from '../utils/auth';
import { AppError } from '../utils/error';
import { compareCity } from '../geo/geo';
import { getClientIp } from '../utils/ip';

export const tokenMiddleware = {
  authenticate: async (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    // Extract tokens from cookies & ip
    const accessToken = getAccessTokenFromCookie(req);
    const refreshToken = getRefreshTokenFromCookie(req);
    const ipAddress = getClientIp(req);

    // Case 1: No tokens provided
    if (!accessToken && !refreshToken) {
      throw new AppError(401, 'No tokens provided—please log in');
    }

    // Case 2: Validate refresh token if it exists
    let refreshTokenValid = false;
    if (refreshToken) {
      const { valid } = await authService.validateRefreshToken(refreshToken);
      if (!valid) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        throw new AppError(401, 'Refresh token invalid or revoked—session ended');
      }
      refreshTokenValid = true;
    }

    // Case 3 removed: No access token but valid refresh token is now allowed
    // If no access token but refresh token is valid, we'll refresh it below

    // Case 4: Validate access token *only if it exists*
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as JwtPayload;

        // Access token valid—verify user and business info
        const user = await authService.getUserById(decoded.userId);
        if (!user) {
          res.clearCookie('accessToken');
          res.clearCookie('refreshToken');
          throw new AppError(404, 'User not found');
        }

        const hasBusinessInDb = !!user.business;
        const hasBusinessInToken = !!decoded.business;
        const businessInfoOutdated = hasBusinessInDb !== hasBusinessInToken;

        if (businessInfoOutdated) {
          if (!refreshTokenValid) {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            throw new AppError(401, 'Business info outdated—no valid refresh token to update');
          }
          // Refresh to update business info
          await refreshAccessToken(req, res, ipAddress, refreshToken!);
          return next();
        }

        // Check if the user's location matches the one in the token
        const tokenLocation = await authService.getDBTokenFromCookie(refreshToken!);
        // Check if IPs are different first
        if (tokenLocation?.ipAddress !== ipAddress) {
          // Only do city comparison if IPs are different
          if (!await compareCity(ipAddress, tokenLocation!.location!)) {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            throw new AppError(500, 'Session expired, please log in again');
          }
        }

        // All checks passed—set user and proceed
        req.user = decoded;
        return next();
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError && refreshTokenValid) {
          // Expired access token with valid refresh token—refresh it
          await refreshAccessToken(req, res, ipAddress, refreshToken!);
          return next();
        }
        // Invalid access token (e.g., tampered)—fail
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        throw new AppError(401, 'Access token invalid—possible manipulation attempt');
      }
    }

    // If we get here: no access token, but valid refresh token exists
    if (refreshTokenValid) {
      await refreshAccessToken(req, res, ipAddress, refreshToken!);
      return next();
    }

    // Fallback: Shouldn’t hit this with current logic, but for safety
    throw new AppError(401, 'Authentication failed—unexpected state');
  },
};

/**
 * Helper function to refresh the access token
 * @param req - Express request object
 * @param res - Express response object
 * @param refreshToken - Valid refresh token
 */
async function refreshAccessToken(
  req: Request & { user?: JwtPayload },
  res: Response,
  ipAddress: string,
  refreshToken: string,
): Promise<void> {
  try {
    // Check if the user's location matches the one in the token
    const tokenLocation = await authService.getDBTokenFromCookie(refreshToken!);
    // Check if IPs are different first
    if (tokenLocation?.ipAddress !== ipAddress) {
      // Only do city comparison if IPs are different
      if (!await compareCity(ipAddress, tokenLocation!.location!)) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        throw new AppError(500, 'Session expired, please log in again');
      }
    }

    const { accessToken: newAccessToken } = await authService.refreshAccessToken(refreshToken, ipAddress, tokenLocation!.location!);
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    const newDecoded = jwt.verify(newAccessToken, process.env.JWT_SECRET!) as JwtPayload;
    req.user = newDecoded;
  } catch (error) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    throw new AppError(401, `Refresh failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export default tokenMiddleware;