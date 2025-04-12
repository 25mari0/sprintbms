export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T; // Remove the { redirect?: string } from here
  redirect?: string; // Add redirect at the top level
}
  
export interface UserData {
  userId: string;
  email: string;
  role: string;
  hasBusiness: boolean;
  isPremium: boolean;
  licenseExpirationDate: string | null;
}
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

export interface AuthResponse {
  token?: string;
  redirect?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface NavigationState {
  toast?: string;
}