export interface JwtPayload {
    userId: string;
    role: string;
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