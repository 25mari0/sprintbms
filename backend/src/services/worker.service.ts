import AppDataSource from "../db/data-source";
import { User } from "../entities/User";
import { Business } from "../entities/Business";
import { VerificationToken } from "../entities/VerificationToken";
import authService from "./auth.service";

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
      business: business,
      role: 'worker'
    });

    await this.userRepository.save(worker);

    const token = await authService.generateVerificationToken(worker.id);

    const resetLink = `${process.env.FRONTEND_URL}/set-password?token=${token}`;

    await emailService.sendPasswordEmail(email, resetLink);

    return worker;
  }
}

export default new WorkerService();