interface JwtPayload {
  userId: string; // Changed from 'id' to 'userId' to match your JWT payload
  role: string;
  iat: number; // Added to represent 'issued at' time
  // Add other fields as needed
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export { JwtPayload };