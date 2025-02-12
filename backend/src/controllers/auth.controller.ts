import { Request, Response, NextFunction } from 'express';
import { User } from '../entities/User';
import AppDataSource from '../db/data-source';
import authService from '../services/auth.service';
import { JwtPayload } from '../types/authTypes';
// import { sendResetEmail } from '../services/email.service';

const userRepository = AppDataSource.getRepository(User);

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
        select: ['id', 'email', 'password', 'role', 'mustChangePassword'],
      });

      if (!user) throw new Error('User does not exist');

      if (!(await user!.validatePassword(password)))
        throw new Error('Invalid credentials');

      if (user!.mustChangePassword) {
        //TO-DO: Redirect to /change-password or similar, or send a special response
        throw new Error('Password must be changed');
      }

      if (user!.role === 'deleted') throw new Error('User account is suspended');

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
      const { workerEmail } = req.body;
      const worker = await userRepository.findOne({ where: { email: workerEmail } });
      if (!worker) throw new Error('Worker not found');

      const owner = await userRepository.findOne({ where: { id: req.user!.userId } });
      if (worker.business?.id !== owner!.business?.id) throw new Error('Worker not associated with business');

      const tempPassword = Math.random().toString(36).substring(2, 10);
      worker!.password = await worker!.hashPassword(tempPassword);
      worker!.mustChangePassword = true;
      worker!.lastPasswordChange = new Date(); // invalidates access tokens

      await userRepository.save(worker!);
      await authService.revokeAllRefreshTokens(worker!.id);
      // await sendResetEmail(email, tempPassword);

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
      user!.mustChangePassword = false;
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
