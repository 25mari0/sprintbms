import { ReactNode } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { UserData } from '../types';
import React from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

// Type helper to ensure children only render with non-null userData
type ProtectedContext = { userData: UserData };

const ProtectedContext = React.createContext<ProtectedContext | undefined>(undefined);

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { userData } = useAuthContext();

  if (!userData) {
    return null; // useAuthCheck redirects, this is a fallback
  }

  return (
    <ProtectedContext.Provider value={{ userData }}>
      {children}
    </ProtectedContext.Provider>
  );
}

export function useProtectedAuthContext() {
  const context = React.useContext(ProtectedContext);
  if (context === undefined) {
    throw new Error('useProtectedAuthContext must be used within a ProtectedRoute');
  }
  return context;
}