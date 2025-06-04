import { User } from '../entities/User';

export const workerTransformer = {
  // Limited data for workers (for booking assignment, etc.)
  limitedData: (worker: { user: User; status: string }) => ({
    user: {
      id: worker.user.id,
      name: worker.user.name,
      role: worker.user.role
    },
    status: worker.status
  }),

  // Full data for owners (management purposes)
  fullData: (worker: { user: User; status: string }) => ({
    user: {
      id: worker.user.id,
      name: worker.user.name,
      email: worker.user.email,
      role: worker.user.role,
      createdAt: worker.user.createdAt,
      updatedAt: worker.user.updatedAt,
      lastPasswordChange: worker.user.lastPasswordChange,
      // Include verificationToken if it exists
    },
    status: worker.status
  })
};