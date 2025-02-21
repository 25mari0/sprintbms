// middlewares/business.middleware.ts
import { Request, Response, NextFunction } from 'express';
import AppDataSource from '../db/data-source';
import { User } from '../entities/User';
import { AppError } from '../utils/error';

const userRepository = AppDataSource.getRepository(User);

export const authMiddleware = {
  tokenUserExists: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(400, 'User ID not found in token');
      }

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new AppError(400, 'User does not exist');
      }
      next();
    } catch (error) {
      next(error);
    }
  },

  //check if user exists
  emailUserExists: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email } = req.body;

      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        throw new AppError(400, 'User does not exist');
      }
      next();
    } catch (error) {
      next(error);
    }
  },
};

export default authMiddleware;
