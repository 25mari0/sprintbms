interface JwtPayload {
    id: string;
    username: string;
    // other fields, tba
  }

declare global {
    namespace Express {
      interface Request {
        user?: JwtPayload;
      }
    }
  }

export { JwtPayload }