import { User } from '../entities/User';
import { Token } from '../entities/Token'; // Assuming you've created this entity
import bcrypt from 'bcryptjs';
import AppDataSource from '../db/data-source';
import jwt from 'jsonwebtoken';
import { MoreThan } from 'typeorm';

class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private tokenRepository = AppDataSource.getRepository(Token);

  private async getUserIdFromRefreshToken(refreshToken: string): Promise<string | null> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as { userId: string };
      return decoded.userId;
    } catch {
      throw new Error('Failed to verify refresh token');
    }
  }

  public generateAccessToken(userId: string, role: string): string {
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET!,
      { expiresIn: '30m' }
    );
  }

  public generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: '30d' }
    );
  }

  public async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    // Generate a salt once
    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(refreshToken, salt);
    
    const newToken = this.tokenRepository.create({
      token: hashedToken,
      userId: userId,
      salt: salt,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
    await this.tokenRepository.save(newToken);
  }

  private async validateRefreshToken(refreshToken: string): Promise<{ userId: string; valid: boolean }> {
    const userId = await this.getUserIdFromRefreshToken(refreshToken);
    if (!userId) {
      return { userId: '', valid: false };
    }
  
    const tokens = await this.tokenRepository.find({ 
      where: { userId },
      relations: ['user']
    });
  
    for (const token of tokens) {
      if (await bcrypt.compare(refreshToken, token.token)) {
        if (token.expiresAt < new Date()) {
          await this.tokenRepository.remove(token); 
          return { userId: '', valid: false };
        }
        return { userId: token.user.id, valid: true };
      }
    }
  
    return { userId: '', valid: false };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const { userId, valid } = await this.validateRefreshToken(refreshToken);
    if (!valid) {
      throw new Error('Invalid or expired refresh token');
    }
  
    const user = await this.userRepository.findOne({ where: { id: userId }, select: ['id', 'role'] });
    if (!user) {
      throw new Error('User not found');
    }
  
    const newAccessToken = this.generateAccessToken(user.id, user.role)
    const newRefreshToken = await this.generateRefreshToken(userId);
    await this.revokeRefreshToken(refreshToken); // revoke the old token
    await this.storeRefreshToken(userId, newRefreshToken); // store the new one
  
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async revokeAllRefreshTokens(userId: string): Promise<void> {
    console.log('Revoking all refresh tokens for user', userId);
    const tokens = await this.tokenRepository.find({ where: { userId } });
    for (const token of tokens) {
      console.log('Revoking token', token.id);
    }
    await this.tokenRepository.delete({ userId });
  }

  public async revokeRefreshToken(refreshToken: string): Promise<void> {
    const { userId, valid } = await this.validateRefreshToken(refreshToken);
    if (valid) {
      await this.tokenRepository.delete({ userId: userId, token: refreshToken });
    }
  }

  public async checkForValidTokens(userId: string): Promise<boolean> {
    const currentDate = new Date();
    const validTokens = await this.tokenRepository.find({
      where: {
        userId: userId,
        expiresAt: MoreThan(currentDate)
      }
    });
    return validTokens.length > 0;
  }

  public async getUserById(userId: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id: userId } });
  }
  
}

export default new AuthService();