import AppDataSource from "../db/data-source";
import { Not } from "typeorm";
import { User } from "../entities/User";
import { Business } from "../entities/Business";
import { VerificationToken } from "../entities/VerificationToken";
import authService from "./auth.service";
import emailService from "./email.service";
import { AppError } from "../utils/error";
import { randomUUID } from "crypto";
import bcrypt from 'bcryptjs';

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
      throw new AppError(400, 'Business not found');
    }

    const existingWorker = await this.userRepository.findOne({ where: { email, role: 'worker' } });
    if (existingWorker) {
      throw new AppError(400, 'Worker with this email already exists');
    }

    // Create new worker
    const worker = this.userRepository.create({
      name: name,
      email: email,
      password: await bcrypt.hash(randomUUID(), 10),
      business: business,
      role: 'worker'
    });
    await this.userRepository.save(worker);

    const token = await authService.generateVerificationToken(worker.id);

    const verificationLink = `${process.env.FRONTEND_URL}/set-password?token=${token}`;

    await emailService.sendWorkerWelcome(email, verificationLink);

    return worker;
  }

  async resetWorkerPassword(ownerId: string, workerId: string): Promise<void> {
    const user = await this.userRepository.findOne({ 
      where: { id: workerId, role: 'worker' },
      relations: ['verificationToken']
    });
    if (!user) throw new AppError(400, 'Worker not found');

    if (!await this.ownerManagesWorker(ownerId, workerId)) {
      throw new AppError(400, 'Worker does not belong to your business');
    }

    if (user.role === 'suspended') {
      throw new AppError(400, 'Worker is suspended');
    }

    // Invalidate existing tokens
    await authService.revokeAllRefreshTokens(workerId);

    // Generate a new verification token for password reset
    const verificationToken = await authService.generateVerificationToken(workerId);

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL}/set-password?token=${verificationToken}`;
    await emailService.sendPasswordReset(user.email, resetLink);
  }

  async resendWorkerPasswordReset(ownerId: string, workerId: string): Promise<void> {
    const user = await this.userRepository.findOne({ 
      where: { id: workerId, role: 'worker' },
      relations: ['verificationToken']
    });
    if (!user) throw new AppError(400, 'Worker not found');

    if (!await this.ownerManagesWorker(ownerId, workerId)) {
      throw new AppError(400, 'Worker does not belong to your business');
    }

    if (user.role === 'suspended') {
      throw new AppError(400, 'Worker is suspended');
    }

    // Invalidate existing tokens
    await authService.revokeAllRefreshTokens(workerId);

    const oldAssignedToken = user.verificationToken;

    // Generate a new verification token for password reset
    const verificationToken = await authService.generateVerificationToken(workerId);

    if (oldAssignedToken) {
      await this.verificationTokenRepository.remove(oldAssignedToken); // Delete the old token
    }

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL}/set-password?token=${verificationToken}`;
    await emailService.sendPasswordReset(user.email, resetLink);
  }

  async setPassword(token: string, password: string): Promise<void> {
    // Start a transaction to ensure atomicity
    await this.userRepository.manager.transaction(async (transactionalEntityManager) => {
      // Validate the token
      const verificationToken = await authService.validateVerificationToken(token);
  
      // Fetch the user with the verificationToken relation
      const user = await transactionalEntityManager.findOne(this.userRepository.target, {
        where: { id: verificationToken!.userId },
        relations: ['verificationToken'],
      });
  
      if (!user) throw new AppError(400, 'User not found');
      if (user.role === 'suspended') throw new AppError(400, 'User is suspended');
      if (user.role !== 'worker') throw new AppError(400, 'User is not a worker');
  
      // Delete the verification token if it exists
      if (user.verificationToken && verificationToken) {
        await transactionalEntityManager.remove(this.verificationTokenRepository.target, user.verificationToken);
        user.verificationToken = undefined; // Clear the relation in memory
      }
  
      // Update the user's password and lastPasswordChange
      user.password = await user.hashPassword(password);
      user.lastPasswordChange = new Date();
  
      // Save the updated user
      await transactionalEntityManager.save(this.userRepository.target, user);
    });
  }

  //check if the owner belongs to the same business as the worker
  private async ownerManagesWorker(ownerId: string, workerId: string): Promise<boolean> {
    const owner = await this.userRepository.findOne({ where: { id: ownerId }, relations: ['business'] });
    const worker = await this.userRepository.findOne({ where: { id: workerId}, relations: ['business'] });

    return !!owner && !!worker && owner.business?.id === worker.business?.id;
  }

  async resendWorkerWelcome(ownerId: string, workerId: string): Promise<void> {
    if (!await this.ownerManagesWorker(ownerId, workerId)) {
      throw new AppError(400, 'Worker does not belong to your business');
    }

    const user = await this.userRepository.findOne({ 
      where: { id: workerId },
      relations: ['verificationToken']
    });
    if (!user) throw new AppError(400, 'Worker not found');

    if (user.role === 'owner') {
      throw new AppError(400, 'User is an owner and cannot receive a welcome email');
    }

    if (await user.getWorkerStatus() == 'suspended') {
      throw new AppError(400, 'Worker is suspended');
    }

    if (await user.getWorkerStatus() !== 'unverified') {
      throw new AppError(400, 'Worker is not awaiting verification');
    }

    const oldAssignedToken = user.verificationToken;

    // Generate a new verification token
    const token = await authService.generateVerificationToken(workerId);

    if (oldAssignedToken) {
      await this.verificationTokenRepository.remove(oldAssignedToken);
    }

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL}/set-password?token=${token}`;
    await emailService.sendWorkerWelcome(user.email, verificationLink);
  }

  //suspend a worker - does not remove verification token, because if the
  //worker is reactivated, they will need to verify their account again 
  //in case they werent verified before suspension
  async suspendWorker(ownerId: string, workerId: string): Promise<void> {
    if (!await this.ownerManagesWorker(ownerId, workerId)) {
      throw new AppError(400, 'Worker does not belong to your business');
    }

    const user = await this.userRepository.findOne({ where: { id: workerId, role: 'worker' } });

    if (!user) throw new AppError(400, 'Worker not found');
    if (user.role == 'suspended') throw new AppError(400, 'Worker is already suspended');

    user.role = 'suspended';
    await this.userRepository.save(user);

    // Invalidate existing tokens
    await authService.revokeAllRefreshTokens(workerId);

    // Send suspension email
    await emailService.sendWorkerSuspended(user.email);
  }

  async reactivateWorker(ownerId: string, workerId: string): Promise<void> {
    if (!await this.ownerManagesWorker(ownerId, workerId)) {
      throw new AppError(400, 'Worker does not belong to your business');
    }

    const user = await this.userRepository.findOne({ where: { id: workerId} });
    if (!user) throw new AppError(400, 'Worker not found');
    if (user.role == 'owner') throw new AppError(400, 'User is an owner and cannot be reactivated as a worker');
    if (user.role !== 'suspended') throw new AppError(400, 'Worker is not suspended');

    user.role = 'worker';
    await this.userRepository.save(user);
  }

  async getWorker(workerId: string, ownerId: string): Promise<{ user: User; status: string }> {
    if (!await this.ownerManagesWorker(ownerId, workerId)) {
      throw new AppError(400, 'Worker does not belong to your business');
    }
    const user = await this.userRepository.findOne({ where: { id: workerId, role: 'worker' } });
    if (!user) throw new AppError(400, 'Worker not found');

    const status = user.role === 'suspended' ? 'suspended' : user.verificationToken ? 'unverified' : 'active';

    return { user, status };
  }

  async getWorkers(businessId: string, ownerId: string): Promise<{ user: User; status: string }[]> {
    const users = await this.userRepository.find({ where: { business: { id: businessId }, id: Not(ownerId) }, relations: ['verificationToken']  });
    const workerStatuses = await Promise.all(users.map(async user => ({
      user,
      status: await user.getWorkerStatus()
    })));

    return workerStatuses;
  }

}

export default new WorkerService();