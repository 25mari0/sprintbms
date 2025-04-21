export interface WorkerUser {
    id: string;
    name: string;
    email: string;
    lastPasswordChange: string;
    role: 'owner' | 'worker' | 'suspended';
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Worker {
    user: WorkerUser;
    status: 'active' | 'suspended' | 'unverified' | 'password-reset';
  }

  export interface WorkerFormData {
    name: string;
    email: string;
  }