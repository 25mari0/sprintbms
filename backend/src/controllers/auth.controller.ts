import { Request, Response, NextFunction } from 'express';
import { User } from '../entities/User';
import AppDataSource from '../db/data-source';
import authService from '../services/auth.service';
import { JwtPayload } from '../types/authTypes';
import { VerificationToken } from '../entities/VerificationToken';
// import { sendResetEmail } from '../services/email.service';

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
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) throw new Error('Email is already in use');

      const user = userRepository.create({ name, email });
      user.password = await user.hashPassword(password);
      await userRepository.save(user);

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        userId: user.id,
      });
    } catch (error) {
      const err = error as Error;
      err.message = `Error registering user: ${err.message}`;
      next(err);
    }
  },

  login: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { email, password } = req.body;

    try {
      const user = await userRepository.findOne({
        where: { email },
        relations: ['verificationToken'],
        select: ['id', 'email', 'password', 'role'],
      });

      if (!user) throw new Error('User does not exist');

      if (!(await user!.validatePassword(password)))
        throw new Error('Invalid credentials');

      if (user!.role === 'deleted') throw new Error('User account is suspended');

      if (user.verificationToken) {
        throw new Error('Password reset required. Please use the reset link sent to your email.');
      }

      const accessToken = authService.generateAccessToken(user!.id, user!.role);
      const refreshToken = await authService.generateRefreshToken(user!.id);

      await authService.storeRefreshToken(user!.id, refreshToken);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ status: 'success', accessToken });
    } catch (error) {
      const err = error as Error;
      err.message = `Error logging in: ${err.message}`;
      next(err);
    }
  },

  resetWorkerPassword: async (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const workerId = req.params.userId; // Assuming userId is passed as a route parameter
      const ownerId = req.user?.userId; // Assuming owner is authenticated
  
      // Check if the owner has permission to reset this worker's password
      const owner = await userRepository.findOne({ where: { id: ownerId }, relations: ['business'] });
      const worker = await userRepository.findOne({ where: { id: workerId, role: 'worker' }, relations: ['business'] });
  
      if (!owner || !worker || owner.business?.id !== worker.business?.id) {
        throw new Error('Worker does not belong to your business');
      }
      
      await authService.resetWorkerPassword(workerId);

      res.status(200).json({
        status: 'success',
        message: 'Temporary password sent to email',
      });
    } catch (error) {
      const err = error as Error;
      err.message = `Error resetting password: ${err.message}`;
      next(err);
    }
  },

  //sets password when using a verification token link
  setPassword: async (
    req: Request, 
    res: Response, 
    next: NextFunction
  ) => {
    const { newPassword, token } = req.body;

    try {
      const verificationToken = await authService.validateVerificationToken(token);
      if (!verificationToken) 
        throw new Error('Invalid or expired token'); 
      
      const user = await userRepository.findOne({ where: { id: verificationToken.userId } });
      if (!user) 
        throw new Error('User not found');
  
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

  validateTokenAndShowForm: async (
    req: Request, 
    res: Response, 
    next: NextFunction
  ) => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') 
      throw new Error('Invalid token');
  
    try {
      const result = await authService.validateVerificationToken(token);
      if (!result) 
        throw new Error('Invalid or expired token');
  
      // For an API, send JSON to indicate the token is valid and the user can proceed
      res.json({ 
        status: 'success', 
        token,
        message: 'Please set your new password.'
      });
  
    } catch (error) {
      next(error);
    }
  },

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
      const err = error as Error;
      err.message = `Error updating password: ${err.message}`;
      next(err);
    }
  },

};

export default authController;
