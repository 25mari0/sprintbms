// Generic API error response
export interface ApiError {
  message: string;
}

// Auth-specific form data interfaces
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// API response types (for consistency)
export interface RegisterResponse {
  message: string;
}

export interface LoginResponse {
  accessToken: string;
  userId: string;
  email: string;
  role: string;
}

export interface TokenValidationResponse {
  status: string;
  token: string;
  message: string;
}

export interface VerifyAccountResponse {
  message: string;
}