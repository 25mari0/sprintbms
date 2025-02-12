import AppDataSource from "../db/data-source";
import { User } from "../entities/User";
import { Business } from "../entities/Business";

class WorkerService {
  private userRepository = AppDataSource.getRepository(User);
  private businessRepository = AppDataSource.getRepository(Business);

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
      role: 'worker',
      mustChangePassword: true,
    });

    // Generate a random password
    const randomPassword = Math.random().toString(36).slice(-8);
    worker.password = await worker.hashPassword(randomPassword);

    // Send the password to the worker's email
    // TO-DO: await sendPasswordEmail(email, randomPassword);

    // Save the worker
    await this.userRepository.save(worker);

    return worker;
  }
}

export default new WorkerService();