import { Request, Response, NextFunction } from 'express';
import { User } from '../entities/User';
import AppDataSource from '../db/data-source';
import authService from '../services/auth.service';
import { JwtPayload } from '../types/authTypes';
import { VerificationToken } from '../entities/VerificationToken';
import { AppError } from '../utils/error';
import businessService from '../services/business.service';

const userRepository = AppDataSource.getRepository(User);
const verificationTokenRepository = AppDataSource.getRepository(VerificationToken);

const authController = {
  register: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { name, email, password } = req.body;

    try {
      const user = await authService.registerUser(name, email, password);

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully, please check your email for the verification link',
        data: { userId: user.id, redirect: '/login' },

      });
    } catch (error) {
      next(error);
    }
  },

  login: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { email, password } = req.body;

    try {
      const user = await authService.authenticateUser(email, password);

      const accessToken = authService.generateAccessToken(user!.id, user!.role, user.business?.id, user.business?.licenseExpirationDate);
      const refreshToken = await authService.generateRefreshToken(user!.id);
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        // prevents issues with http and https in development
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 4 * 60 * 1000, // 4 minutes for testing
      });

      const business = await businessService.getBusinessByUserId(user.id);
      let redirect = '/dashboard';
      if (!business) {
        redirect = '/business/create?mode=create';
      } else if (business.licenseExpirationDate < new Date()) {
        redirect = '/business/create?mode=renew';
      }

      res.status(200).json({
        status: 'success',
        message: 'Logged in successfully',
        data: { redirect },
      });
    } catch (error) {
      next(error);
    }
  },

  logout: async (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
      try {
        authService.revokeAllRefreshTokens(req.user!.userId!)

        res.clearCookie('refreshToken', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        res.clearCookie('accessToken', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        
        res.status(200).json({ 
          status: 'success', 
          message: 'Logged out successfully',
          data: { redirect: '/login' }});
      } catch (error) {
        next(error);
      }
  },

  getUserData: async (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const business = await businessService.getBusinessByUserId(userId);
      const user = await authService.getUserById(userId)

      const responseData = {
        userId,
        email: user?.email,  // email is not in the token payload
        role: user?.role,
        hasBusiness: !!business, // True if business exists
        isPremium: business ? business.licenseExpirationDate > new Date() : false, // True if not expired
        licenseExpirationDate: business?.licenseExpirationDate || null, // Null if no business
      };

      let redirect = '/dashboard';
      if (!responseData.hasBusiness) {
        redirect = '/business/create?mode=create';
      } else if (!responseData.isPremium) {
        redirect = '/business/create?mode=renew';
      }

      res.status(200).json({ status: 'success', data: {responseData}, redirect });
    } catch (error) {
      next(error);
    }
  },

  //sets password when using a verification token link
  setPasswordToken: async (
    req: Request, 
    res: Response, 
    next: NextFunction
  ) => {
    const { password: newPassword, token } = req.body;

    try {
      const verificationToken = await authService.validateVerificationToken(token);
      
      const user = await userRepository.findOne({ where: { id: verificationToken!.userId } });
      if (!user) 
        throw new AppError(400, 'User not found');
  
      user.password = await user.hashPassword(newPassword);
      user.lastPasswordChange = new Date();
      if (user.verificationToken) {
        await verificationTokenRepository.remove(user.verificationToken); // Delete the token
      }
  
      await userRepository.save(user);
  
      // Redirect or respond with success, depending on your frontend needs
      res.json({ 
        status: 'success', 
        message: 'Password set successfully. Please log in with your new password.', 
        data: { redirect: '/login' },
      });
    } catch (error) {
      next(error);
    }
  },

  validateVerificationToken: async (
    req: Request, 
    res: Response, 
    next: NextFunction
  ) => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') 
      throw new AppError(401, 'Invalid token');
  
    try {
      await authService.validateVerificationToken(token);
  
      // For an API, send JSON to indicate the token is valid and the user can proceed
      res.status(200).json({ 
        status: 'success', 
        message: 'Token is valid.',
        data: { token },
      });
  
    } catch (error) {
      next(error);
    }
  },

  verifyAccount: async (
    req: Request, 
    res: Response, 
    next: NextFunction
  ) => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') 
      throw new AppError(401, 'Invalid token');

    try {
      const verificationToken = await authService.validateVerificationToken(token);

      const user = await userRepository.findOne({ 
        where: { id: verificationToken!.userId },
        relations: ['verificationToken'], // Load the relation
      });
      
      if (!user) 
        throw new AppError(401, 'User not found');

      if (user.verificationToken && verificationToken) {
        await verificationTokenRepository.remove(user.verificationToken); // Delete the token
      }    

      // Redirect or respond with success, depending on your frontend needs
      res.status(200).json({ 
        status: 'success', 
        message: 'Account verified successfully. Please log in with your password.', 
        data: { redirect: '/login' },
      });
    } catch (error) {
      next(error);
    }
  },

  resendVerificationLink: async (
    req: Request, 
    res: Response, 
    next: NextFunction
  ) => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') 
      throw new AppError(400, 'Invalid token');

    try {
      const result = await authService.getUserIdFromVerificationToken(token);
      //if a valid token is still available, we delete it and send a new email
      if (!result)
        throw new AppError(401, 'Verification token is invalid')

      const newToken = await authService.resendVerificationToken(result.userId);

      res.status(200).json({ 
        status: 'success', 
        message: 'Verification link was re-sent to the email.',
        data: { token: newToken }
      });

    } catch (error) {
      next(error);
    }  
  },


  //update password for logged in user
  updatePassword: async (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const newPassword = req.body;
      const userId = req.user!.userId;
      const user = await userRepository.findOne({ where: { id: userId } });

      user!.password = await user!.hashPassword(newPassword);
      user!.lastPasswordChange = new Date();

      await userRepository.save(user!);
      await authService.revokeAllRefreshTokens(user!.id);

      res.status(200).json({ 
        status: 'success',
        message: 'Password updated successfully' 
      });
    } catch (error) {
      next(error);
    }
  },

};

export default authController;
