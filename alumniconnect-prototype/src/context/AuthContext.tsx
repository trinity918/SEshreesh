import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, registerUser } from '@/services/apiMock';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  user: {
    id?: string;
    email?: string;
    role?: string;
    name?: string;
    token?: string;
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: 'student' | 'alumni' | 'admin') => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'student' | 'alumni';
  year?: string;
  branch?: string;
  skills?: string[];
  interests?: string[];
  cvFileName?: string;
  company?: string;
  designation?: string;
  industry?: string;
  expertise?: string[];
  availability?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('alumniconnect_token');
    if (storedToken) {
      try {
        const decoded: any = jwtDecode(storedToken);
        setUser({
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          name: decoded.email.split('@')[0],
          token: storedToken,
        });
      } catch {
        setUser({ token: storedToken, name: 'User' });
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'student' | 'alumni' | 'admin') => {
    try {
      const response = await loginUser({ email, password, role });
      if (response && response.token) {
        localStorage.setItem('alumniconnect_token', response.token);
        try {
          const decoded: any = jwtDecode(response.token);
          setUser({
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            name: decoded.email.split('@')[0],
            token: response.token,
          });
        } catch {
          setUser({ email, role, token: response.token, name: 'User' });
        }
        return { success: true, message: 'Login successful!' };
      }
      return { success: false, message: 'Invalid credentials or account not approved.' };
    } catch (error) {
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('alumniconnect_token');
  };

  const register = async (data: RegisterData) => {
    try {
      const result = await registerUser(data);
      return result;
    } catch (error) {
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
