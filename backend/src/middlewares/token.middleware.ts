import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/authTypes'; // Adjust path as needed
import authService from '../services/auth.service'; // Adjust path as needed
import { getRefreshTokenFromCookie, getAccessTokenFromCookie } from '../utils/auth'; // Adjust path as needed
import { AppError } from '../utils/error'; // Adjust path as needed

/** Token middleware object with authenticate method */
export const tokenMiddleware = {
  authenticate: async (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    // Extract tokens from cookies
    const accessToken = getAccessTokenFromCookie(req);
    const refreshToken = getRefreshTokenFromCookie(req);

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

    // Case 3: No access token, but valid refresh token—refresh, block
    // can be considered the same as a manipulated token
    if (!accessToken && refreshTokenValid) {
      res.clearCookie('refreshToken');
      throw new AppError(401, 'Missing an access token, please log-in again');
    }

    // Case 4: Validate access token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(accessToken!, process.env.JWT_SECRET!) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError && refreshTokenValid) {
        // Expired access token with valid refresh token—refresh it
        await refreshAccessToken(req, res, refreshToken!);
        return next();
      }
      // Invalid access token (e.g., tampered)—fail
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      throw new AppError(401, 'Access token invalid—possible manipulation attempt');
    }

    // Case 5: Access token valid—verify user and business info
    const user = await authService.getUserById(decoded.userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const hasBusinessInDb = !!user.business;
    const hasBusinessInToken = !!decoded.business;
    const businessInfoOutdated = hasBusinessInDb !== hasBusinessInToken;

    if (businessInfoOutdated) {
      if (!refreshTokenValid) {
        throw new AppError(401, 'Business info outdated—no valid refresh token to update');
      }
      // Refresh to update business info
      await refreshAccessToken(req, res, refreshToken!);
      return next();
    }

    // All checks passed—set user and proceed
    req.user = decoded;
    next();
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
  refreshToken: string,
): Promise<void> {
  try {
    // Generate new access token
    const { accessToken: newAccessToken } = await authService.refreshAccessToken(refreshToken);
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Verify the new token
    const newDecoded = jwt.verify(newAccessToken, process.env.JWT_SECRET!) as JwtPayload;

    // Set the new decoded user data
    req.user = newDecoded;
  } catch (error) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    throw new AppError(401, `Refresh failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export default tokenMiddleware;