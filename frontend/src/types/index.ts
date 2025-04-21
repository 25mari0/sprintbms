export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T; 
  redirect?: string; 
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NavigationState {
  toast?: string;
}