export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T; 
  redirect?: string; 
}

export interface NavigationState {
  toast?: string;
}