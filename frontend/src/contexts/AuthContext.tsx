import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(() => {
    const storedToken = localStorage.getItem('accessToken');
    console.log('AuthProvider initial token:', storedToken); // Debug
    return storedToken;
  });

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('accessToken', newToken);
    } else {
      localStorage.removeItem('accessToken');
    }
    setTokenState(newToken);
  };

  const logout = () => setToken(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken !== token) {
      console.log('Syncing token on mount:', storedToken); // Debug
      setTokenState(storedToken);
    }
  }, []); // Runs once on mount

  const value = {
    isAuthenticated: !!token,
    token,
    setToken,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
