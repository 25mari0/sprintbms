export interface JwtPayload {
  userId: string;
  role: string;
  business?: { id: string }; // Optional, since it might not be available in all scenarios
  iat: number;
}

export interface TokenValidationResult {
  userId: string;
  valid: boolean;
}

export interface User {
  id: string;
  role: string;
  // other common user properties
}

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}
