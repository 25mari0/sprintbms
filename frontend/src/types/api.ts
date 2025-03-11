export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T & { redirect?: string };
}

export interface UserData {
  userId: string;
  email: string;
  role: string;
  hasBusiness: boolean;
  isPremium: boolean;
  licenseExpirationDate: string | null;
}