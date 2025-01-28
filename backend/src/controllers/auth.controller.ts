import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../entities/User';
import AppDataSource from '../db/data-source';
import authService from '../services/auth.service';
// import { sendResetEmail } from '../services/email.service';

const userRepository = AppDataSource.getRepository(User);

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  try {
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) throw new Error('Email is already in use');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = userRepository.create({ email, password: hashedPassword });
    await userRepository.save(user);

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role', 'mustChangePassword'],
    });

    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const accessToken = authService.generateAccessToken(user.id, user.role);
    const refreshToken = await authService.generateRefreshToken(user.id);

    await authService.storeRefreshToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
};


export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await userRepository.findOne({ where: { email } });
    if (!user) return next(new Error('User not found'));



    const temporaryPassword = Math.random().toString(36).substring(2, 10);
    user.password = await bcrypt.hash(temporaryPassword, 10);
    user.mustChangePassword = true;
    user.lastPasswordChange = new Date(); // invalidates access tokens

    await userRepository.save(user);
    await authService.revokeAllRefreshTokens(user.id)
    // await sendResetEmail(email, temporaryPassword);

    res.status(200).json({ message: 'Temporary password sent to your email' });
  } catch (error) {
    const err = new Error('Error resetting password');
    (err as { originalError?: unknown }).originalError = error;
    next(err);
  }
};

export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { userId, newPassword } = req.body;

  try {
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) return next(new Error('User not found'));

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;

    await userRepository.save(user);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    const err = new Error('Error updating password');
    (err as { originalError?: unknown }).originalError = error;
    next(err);
  }
};
