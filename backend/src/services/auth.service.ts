import { User } from '../entities/User';
import { Token } from '../entities/Token'; // Assuming you've created this entity
import bcrypt from 'bcryptjs';
import AppDataSource from '../db/data-source';
import jwt from 'jsonwebtoken';
import { MoreThan } from 'typeorm';
import { VerificationToken } from '../entities/VerificationToken';
import { v4 as uuidv4 } from 'uuid';
import emailService from './email.service';
import { AppError } from '../utils/error';

class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private tokenRepository = AppDataSource.getRepository(Token);
  private verificationTokenRepository = AppDataSource.getRepository(VerificationToken);

  private async getUserIdFromRefreshToken(
    refreshToken: string,
  ): Promise<string | null> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!,
      ) as { userId: string };
      return decoded.userId;
    } catch {
      throw new AppError(400, 'Failed to verify refresh token');
    }
  }

  async authenticateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['verificationToken', 'business'],
      select: ['id', 'email', 'password', 'role', 'business'],
    });

    if (!user) throw new AppError(400, 'User does not exist');
    if (!(await user.validatePassword(password))) throw new AppError(400, 'Invalid credentials');
    if (user.role === 'suspended') throw new AppError(400, 'User account is suspended');
    if (user.verificationToken && user.role == 'worker') throw new AppError(400, 'Password reset required. Please use the reset link sent to your email.');
    if (user.verificationToken && user.role == 'owner') throw new AppError(400, 'Account is not verified. Please use the verification link sent to your email')

    return user;
  }

  async registerUser(name: string, email: string, password: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) throw new AppError(400, 'Email is already in use');

    const user = this.userRepository.create({ name, email });
    user.password = await user.hashPassword(password);
    await this.userRepository.save(user);
    const token = await this.generateVerificationToken(user.id)
    const verificationLink = `${process.env.FRONTEND_URL}/verify-account?token=${token}`;
    emailService.sendAccountVerification(email, verificationLink)
    return user
  }

  // needs to be re-generated when a subscription/business is purchased
  // so that it contains the updated business ID
  public generateAccessToken(
    userId: string,
    role: string,
    businessId?: string,
    licenseExpirationDate?: Date
  ): string {
    return jwt.sign(
      { userId, role, business: businessId ? { id: businessId, licenseExpirationDate  } : undefined },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' },
    );
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: '30d',
    });
    await this.storeRefreshToken(userId, refreshToken);
    return refreshToken;
  }

  public async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedToken = await bcrypt.hash(refreshToken, salt);
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
      await this.tokenRepository.manager.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.upsert(
          Token,
          { userId, token: hashedToken, salt, expiresAt },
          ['userId'] // Conflict target: update if userId exists
        );
      });
    } catch (error) {
      const err = error as Error;
      err.message = `Error storing refresh token: ${err.message}`;
      throw err;
    }
  }

  async validateRefreshToken(
    refreshToken: string,
  ): Promise<{ userId: string; valid: boolean }> {
    try {
      const userId = await this.getUserIdFromRefreshToken(refreshToken);
      if (!userId) {
        return { userId: '', valid: false };
      }

      const tokens = await this.tokenRepository.find({
        where: { userId },
        select: ['token', 'expiresAt'],
      });

      for (const token of tokens) {
        if (await bcrypt.compare(refreshToken, token.token)) {
          if (token.expiresAt < new Date()) {
            return { userId: '', valid: false };
          }
          return { userId, valid: true };
        }
      }
      return { userId: '', valid: false };
    } catch (error) {
      const err = error as Error;
      err.message = `Error validating refresh token: ${err.message}`;
      throw err;
    }
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const { userId, valid } = await this.validateRefreshToken(refreshToken);
      if (!valid) {
        throw new AppError(400, 'Invalid or expired refresh token');
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'role', 'business'],
        relations: ['business'],
      });

      if (!user) {
        throw new AppError(400, 'User not found');
      }

      const newAccessToken = this.generateAccessToken(user.id, user.role, user.business?.id, user.business?.licenseExpirationDate);
      const newRefreshToken = await this.generateRefreshToken(userId);
      await this.revokeRefreshToken(refreshToken); // revoke the old token
      await this.storeRefreshToken(userId, newRefreshToken); // store the new one

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      const err = error as Error;
      err.message = `Error refreshing access token: ${err.message}`;
      throw err; // Unexpected error
    }
  }

  async revokeAllRefreshTokens(userId: string): Promise<void> {
    try {
      await this.tokenRepository.delete({ userId });
    } catch {
      throw new AppError(400, 'Failed to revoke all refresh tokens');
    }
  }

  public async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      const { userId, valid } = await this.validateRefreshToken(refreshToken);
      if (valid) {
        await this.tokenRepository.delete({
          userId: userId,
          token: refreshToken,
        });
      }
    } catch {
      throw new AppError(400, 'Failed to revoke refresh token');
    }
  }

  public async hasValidRefreshTokens(userId: string): Promise<boolean> {
    try {
      const currentDate = new Date();
      const validTokens = await this.tokenRepository.find({
        where: {
          userId: userId,
          expiresAt: MoreThan(currentDate),
        },
      });
      return validTokens.length > 0;
    } catch {
      throw new AppError(400, 'Error checking for valid refresh tokens')
    }
  }

  public async getUserById(userId: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { id: userId },
        relations: ['business'],
      });
    } catch  {
      throw new AppError(400, 'Error trying to grab user')
    }
  }

  //generates AND stores
  async generateVerificationToken(userId: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['verificationToken'] });
    if (!user) throw new AppError(400, 'User not found');

    // Remove any existing token
    if (user.verificationToken) {
      await this.verificationTokenRepository.remove(user.verificationToken);
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes

    try {
      await this.verificationTokenRepository.manager.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.upsert(
          VerificationToken,
          { token, expiresAt, user },
          ['user'] // update if user exists
        );
      });
    } catch (error) {
      throw new AppError(500, `Error storing verification token: ${(error as Error).message}`);
    }

    return token;
  }

  async validateVerificationToken(token: string): Promise<{ userId: string } | null> {
    const verificationToken = await this.verificationTokenRepository.findOne({ where: { token }, relations: ['user'] });
    // first check if the token exists
    if (!verificationToken) {
      throw new AppError(401, 'Invalid token');
    }
    // now check if the token is expired
    if (verificationToken.expiresAt < new Date()) {
      throw new AppError(400, 'Expired token');
    }
    return { userId: verificationToken.user.id };
  }

  async getUserIdFromVerificationToken(token: string): Promise<{ userId: string } | null> {
    const verificationToken = await this.verificationTokenRepository.findOne({ where: { token }, relations: ['user'] });
    if(verificationToken) {
      return { userId: verificationToken.user.id };
    }
   return null;
  }

  async resendPasswordToken(userId: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new AppError(400, 'User not found');

    const newToken = await this.generateVerificationToken(userId);
    const verificationLink = `${process.env.FRONTEND_URL}/reset-password?token=${newToken}`;
    emailService.sendPasswordReset(user.email, verificationLink);
    return newToken;
  }

  async resendVerificationToken(userId: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new AppError(400, 'User not found');

    const newToken = await this.generateVerificationToken(userId);
    const verificationLink = `${process.env.FRONTEND_URL}/verify-account?token=${newToken}`;
    emailService.sendAccountVerification(user.email, verificationLink);
    return newToken;
  }


}

export default new AuthService();
