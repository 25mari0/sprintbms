import AppDataSource from "../db/data-source";
import { User } from "../entities/User";
import { Business } from "../entities/Business";
import { VerificationToken } from "../entities/VerificationToken";
import authService from "./auth.service";
import emailService from "./email.service";

class WorkerService {
  private userRepository = AppDataSource.getRepository(User);
  private businessRepository = AppDataSource.getRepository(Business);
  private verificationTokenRepository = AppDataSource.getRepository(VerificationToken);

  public async addWorker(
    businessId: string,
    name: string,
    email: string
  ): Promise<User> {
    const business = await this.businessRepository.findOne({ where: { id: businessId } });

    if (!business) {
      throw new Error('Business not found');
    }

    // Create new worker
    const worker = this.userRepository.create({
      name: name,
      email: email,
      password: '',
      business: business,
      role: 'worker'
    });

    await this.userRepository.save(worker);

    const token = await authService.generateVerificationToken(worker.id);

    const resetLink = `${process.env.FRONTEND_URL}/set-password?token=${token}`;

    await emailService.sendWorkerWelcomeEmail(email, resetLink);

    return worker;
  }

  async resetWorkerPassword(ownerId: string, workerId: string): Promise<void> {
    const user = await this.userRepository.findOne({ 
      where: { id: workerId, role: 'worker' },
      relations: ['verificationToken']
    });
    if (!user) throw new Error('Worker not found');
    
    if (!await this.canResetPassword(ownerId, workerId)) {
      throw new Error('Worker does not belong to your business');
    }

    // Invalidate existing tokens
    await authService.revokeAllRefreshTokens(workerId);
    await authService.revokeAccessTokens(workerId);

    // Generate a new verification token for password reset
    const verificationToken = await authService.generateVerificationToken(workerId);

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL}/set-password?token=${verificationToken}`;
    await emailService.sendPasswordResetEmail(user.email, resetLink);
  }

  //check if the owner belongs to the same business as the worker
  private async canResetPassword(ownerId: string, workerId: string): Promise<boolean> {
    const owner = await this.userRepository.findOne({ where: { id: ownerId }, relations: ['business'] });
    const worker = await this.userRepository.findOne({ where: { id: workerId, role: 'worker' }, relations: ['business'] });
    
    return !!owner && !!worker && owner.business?.id === worker.business?.id;
  }

}

export default new WorkerService();