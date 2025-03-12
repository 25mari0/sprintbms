import { createContext, useContext, ReactNode } from 'react';
import { AuthContextType } from '../types';
import { useAuthCheck } from '../hooks/useAuthCheck';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { userData } = useAuthCheck();

  return (
    <AuthContext.Provider value={{ userData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}