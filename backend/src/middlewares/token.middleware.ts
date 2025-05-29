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

  // Step 1: Extract tokens and IP
  const accessToken = getAccessTokenFromCookie(req);
  const refreshToken = getRefreshTokenFromCookie(req);
  const ipAddress = getClientIp(req);

  // Case 1: No tokens provided
  if (!accessToken && !refreshToken) {
    throw new AppError(401, 'No tokens provided—please log in');
  }

  // Step 2: Try access token first (most common case)
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as JwtPayload;

      // Step 3: Quick user existence check (cache this if needed)
      const user = await authService.getUserById(decoded.userId);
      
      if (!user) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        throw new AppError(404, 'User not found');
      }

      // Step 4: Check business info consistency
      const hasBusinessInDb = !!user.business;
      const hasBusinessInToken = !!decoded.business;
      const businessInfoOutdated = hasBusinessInDb !== hasBusinessInToken;

      if (businessInfoOutdated) {
        // Only now validate refresh token if we need to refresh
        if (!refreshToken) {
          throw new AppError(401, 'Business info outdated—no refresh token available');
        }
        
        const { valid } = await authService.validateRefreshToken(refreshToken);
        
        if (!valid) {
          res.clearCookie('accessToken');
          res.clearCookie('refreshToken');
          throw new AppError(401, 'Business info outdated—refresh token invalid');
        }
        
        await refreshAccessToken(req, res, ipAddress, refreshToken);
        return next();
      }

      // Step 5: Location verification (only if we have refresh token)
      if (refreshToken) {
        const tokenLocation = await authService.getDBTokenFromCookie(refreshToken);
        
        // Only check location if IPs are different
        if (tokenLocation?.ipAddress !== ipAddress) {
          const cityMatch = await compareCity(ipAddress, tokenLocation!.location!);
          
          if (!cityMatch) {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            throw new AppError(500, 'Session expired, please log in again');
          }
        }
      }

      // Success case - access token is valid
      req.user = decoded;
      return next();

    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        // Fall through to refresh token validation
      } else {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        throw new AppError(401, 'Access token invalid—possible manipulation attempt');
      }
    }
  }

  // Step 6: Only validate refresh token if access token failed/expired
  if (refreshToken) {
    const { valid } = await authService.validateRefreshToken(refreshToken);
    
    if (!valid) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      throw new AppError(401, 'Refresh token invalid or revoked—session ended');
    }

    await refreshAccessToken(req, res, ipAddress, refreshToken);
    return next();
  }

  // Fallback
  throw new AppError(401, 'Authentication failed—no valid tokens');

  },
};

/**
 * Helper function to refresh the access token with timing
 */
async function refreshAccessToken(
  req: Request & { user?: JwtPayload },
  res: Response,
  ipAddress: string,
  refreshToken: string,
): Promise<void> {

  try {
    // Step 1: Location check
    const tokenLocation = await authService.getDBTokenFromCookie(refreshToken);
    
    // Check if IPs are different first
    if (tokenLocation?.ipAddress !== ipAddress) {
      const cityMatch = await compareCity(ipAddress, tokenLocation!.location!);
      
      if (!cityMatch) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        throw new AppError(500, 'Session expired, please log in again');
      }
    }

    // Step 2: Refresh the token
    const { accessToken: newAccessToken } = await authService.refreshAccessToken(
      refreshToken, 
      ipAddress, 
      tokenLocation!.location!
    );

    // Step 3: Set cookie and decode
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
