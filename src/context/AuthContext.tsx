import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, remember: boolean) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS: User[] = [
  {
    id: '1', employeeId: 'EMP003', name: 'Rahul Verma', email: 'hr@company.com',
    role: 'hr', department: 'HR', designation: 'HR Manager',
    joinDate: '2021-06-10', phone: '+91 98765 43212', status: 'active',
  },
  {
    id: '2', employeeId: 'EMP001', name: 'Arjun Sharma', email: 'employee@company.com',
    role: 'employee', department: 'Engineering', designation: 'Senior Developer',
    joinDate: '2022-01-15', phone: '+91 98765 43210', status: 'active',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('hr_portal_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string, remember: boolean): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    const found = MOCK_USERS.find(u => u.email === email);
    if (found) {
      setUser(found);
      if (remember) localStorage.setItem('hr_portal_user', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hr_portal_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
