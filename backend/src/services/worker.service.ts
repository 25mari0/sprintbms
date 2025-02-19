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

    await emailService.sendWorkerWelcome(email, resetLink);

    return worker;
  }

  async resetWorkerPassword(ownerId: string, workerId: string): Promise<void> {
    const user = await this.userRepository.findOne({ 
      where: { id: workerId, role: 'worker' },
      relations: ['verificationToken']
    });
    if (!user) throw new Error('Worker not found');

    if (!await this.ownerManagesWorker(ownerId, workerId)) {
      throw new Error('Worker does not belong to your business');
    }

    // Invalidate existing tokens
    await authService.revokeAllRefreshTokens(workerId);
    await authService.revokeAccessTokens(workerId);

    // Generate a new verification token for password reset
    const verificationToken = await authService.generateVerificationToken(workerId);

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL}/set-password?token=${verificationToken}`;
    await emailService.sendPasswordReset(user.email, resetLink);
  }

  //check if the owner belongs to the same business as the worker
  private async ownerManagesWorker(ownerId: string, workerId: string): Promise<boolean> {
    const owner = await this.userRepository.findOne({ where: { id: ownerId }, relations: ['business'] });
    const worker = await this.userRepository.findOne({ where: { id: workerId, role: 'worker' }, relations: ['business'] });
    
    return !!owner && !!worker && owner.business?.id === worker.business?.id;
  }

  async suspendWorker(ownerId: string, workerId: string): Promise<void> {
    if (!await this.ownerManagesWorker(ownerId, workerId)) {
      throw new Error('Worker does not belong to your business');
    }

    const user = await this.userRepository.findOne({ where: { id: workerId, role: 'worker' } });
    if (!user) throw new Error('Worker not found');

    user.role = 'suspended';
    await this.userRepository.save(user);

    // Invalidate existing tokens
    await authService.revokeAllRefreshTokens(workerId);
    await authService.revokeAccessTokens(workerId);

    // Send suspension email
    await emailService.sendWorkerSuspended(user.email);
  }

  async reactivateWorker(ownerId: string, workerId: string): Promise<void> {
    if (!await this.ownerManagesWorker(ownerId, workerId)) {
      throw new Error('Worker does not belong to your business');
    }

    const user = await this.userRepository.findOne({ where: { id: workerId, role: 'worker' } });
    if (!user) throw new Error('Worker not found');

    user.role = 'worker';
    await this.userRepository.save(user);
  }

}

export default new WorkerService();