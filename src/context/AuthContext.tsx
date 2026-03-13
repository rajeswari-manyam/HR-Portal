import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loginWithToken: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFirstTimeUser: boolean;
  completeRegistration: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// ✅ Scoped session key per employee
export function sessionKey(employeeId: string) {
  return `session_data_${employeeId}`;
}

export function checkIsFirstTimeUser(): boolean {
  return !localStorage.getItem('hr_portal_initialized');
}

export function markAppInitialized() {
  localStorage.setItem('hr_portal_initialized', 'true');
}

export function markLoginTime(employeeId: string) {
  const key = todayKey();
  const raw = localStorage.getItem(sessionKey(employeeId));
  const stored = raw ? JSON.parse(raw) : {};
  const now = Date.now();

  if (stored.date !== key) {
    localStorage.setItem(sessionKey(employeeId), JSON.stringify({
      date: key,
      accumulatedSeconds: 0,
      firstLoginAt: now,
      loginAt: now,
    }));
  } else {
    localStorage.setItem(sessionKey(employeeId), JSON.stringify({
      date: key,
      accumulatedSeconds: stored.accumulatedSeconds || 0,
      firstLoginAt: stored.firstLoginAt || now,
      loginAt: now,
    }));
  }
}

export function markLogoutTime(employeeId: string) {
  const raw = localStorage.getItem(sessionKey(employeeId));
  if (!raw) return;
  const stored = JSON.parse(raw);
  if (!stored.loginAt) return;

  const elapsed = Math.floor((Date.now() - stored.loginAt) / 1000);
  localStorage.setItem(sessionKey(employeeId), JSON.stringify({
    date: stored.date,
    accumulatedSeconds: (stored.accumulatedSeconds || 0) + elapsed,
    firstLoginAt: stored.firstLoginAt,
    loginAt: null,
  }));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  useEffect(() => {
    const firstTime = checkIsFirstTimeUser();
    setIsFirstTimeUser(firstTime);

    const stored = localStorage.getItem('hr_portal_user');
    if (stored) {
      try {
        const parsedUser: User = JSON.parse(stored);
        setUser(parsedUser);
        markLoginTime(parsedUser.employeeId); // ✅ scoped to this user
      } catch {
        localStorage.removeItem('hr_portal_user');
      }
    }
    setIsLoading(false);
  }, []);

  const completeRegistration = () => {
    markAppInitialized();
    setIsFirstTimeUser(false);
  };

  const loginWithToken = (token: string, userData: User) => {
    localStorage.setItem('hr_token', token);
    localStorage.setItem('hr_portal_user', JSON.stringify(userData));
    setUser(userData);
    markLoginTime(userData.employeeId); // ✅ scoped to this user
  };

  const logout = () => {
    if (user?.employeeId) {
      markLogoutTime(user.employeeId); // ✅ scoped to this user
    }
    setUser(null);
    localStorage.removeItem('hr_portal_user');
    localStorage.removeItem('hr_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loginWithToken,
      logout,
      isAuthenticated: !!user,
      isLoading,
      isFirstTimeUser,
      completeRegistration,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}