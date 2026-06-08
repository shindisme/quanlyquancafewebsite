import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import authService from '../services/authService';
import { toast } from 'react-toastify';

const TOKEN_DURATION = 7 * 60 * 60 * 1000; // 7 giờ

interface User {
  id: string;
  username: string;
  email?: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      const expiry = localStorage.getItem('tokenExpiry');

      if (token && expiry && Date.now() < parseInt(expiry)) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiry');
        }
      } else if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiry');
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = (accessToken: string, userData: User) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('tokenExpiry', String(Date.now() + TOKEN_DURATION));
    setUser(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.info('Đã đăng xuất');
  };

  const updateUser = (fields: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...fields } : null));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
