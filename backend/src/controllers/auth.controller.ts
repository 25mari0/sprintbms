import { Request, Response, NextFunction } from 'express';
import { User } from '../entities/User';
import AppDataSource from '../db/data-source';
import authService from '../services/auth.service';
import { JwtPayload } from '../types/authTypes';
import { VerificationToken } from '../entities/VerificationToken';
import { AppError } from '../utils/error';

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
        userId: user.id,
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

      const accessToken = authService.generateAccessToken(user!.id, user!.role, user.business?.id);
      const refreshToken = await authService.generateRefreshToken(user!.id);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ status: 'success', accessToken });
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
        authService.revokeAccessTokens(req.user!.userId!)

        res.status(200).json({ status: 'success'});
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
      user.lastPasswordChange = new Date(); // Invalidate existing access tokens
      if (user.verificationToken) {
        await verificationTokenRepository.remove(user.verificationToken); // Delete the token
      }
  
      await userRepository.save(user);
  
      // Redirect or respond with success, depending on your frontend needs
      res.json({ 
        status: 'success', 
        message: 'Password set successfully. Please log in with your new password.', 
        redirect: '/login'
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
      throw new AppError(400, 'Invalid token');
  
    try {
      await authService.validateVerificationToken(token);
  
      // For an API, send JSON to indicate the token is valid and the user can proceed
      res.json({ 
        status: 'success', 
        token,
        message: 'Token is valid.'
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
    const token = req.body.token;

    try {
      const verificationToken = await authService.validateVerificationToken(token);

      const user = await userRepository.findOne({ 
        where: { id: verificationToken!.userId },
        relations: ['verificationToken'], // Load the relation
      });
      
      if (!user) 
        throw new AppError(400, 'User not found');

      if (user.verificationToken && verificationToken) {
        console.log('removing token')
        await verificationTokenRepository.remove(user.verificationToken); // Delete the token
      }

      console.log('user verified')
    

      // Redirect or respond with success, depending on your frontend needs
      res.json({ 
        status: 'success', 
        message: 'Account verified successfully. Please log in with your password.', 
        redirect: '/login'
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
        throw new AppError(400, 'Verification token is invalid')

      authService.resendPasswordToken(result.userId)

      res.json({ 
        status: 'success', 
        token,
        message: 'Verification link was re-sent to the email.'
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
      user!.lastPasswordChange = new Date(); // invalidates access tokens

      await userRepository.save(user!);
      await authService.revokeAllRefreshTokens(user!.id);

      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  },

};

export default authController;
