import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

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

// ── Exported helpers (used by dashboard + attendance) ────────────────────────

/** Returns today as "YYYY-MM-DD" */
export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Called on every login.
 * - New day  → resets everything, stamps firstLoginAt + loginAt
 * - Same day → keeps accumulatedSeconds & firstLoginAt, updates loginAt only
 */
export function markLoginTime() {
  const key = todayKey();
  const raw = localStorage.getItem('session_data');
  const stored = raw ? JSON.parse(raw) : {};
  const now = Date.now();

  if (stored.date !== key) {
    // Brand-new day
    localStorage.setItem('session_data', JSON.stringify({
      date: key,
      accumulatedSeconds: 0,
      firstLoginAt: now,   // ← very first check-in of the day
      loginAt: now,
    }));
  } else {
    // Same day — preserve firstLoginAt and accumulated time
    localStorage.setItem('session_data', JSON.stringify({
      date: key,
      accumulatedSeconds: stored.accumulatedSeconds || 0,
      firstLoginAt: stored.firstLoginAt || now,  // keep original first login
      loginAt: now,
    }));
  }
}

/**
 * Called on logout.
 * Adds elapsed seconds to accumulatedSeconds, clears loginAt (no active session).
 */
export function markLogoutTime() {
  const raw = localStorage.getItem('session_data');
  if (!raw) return;
  const stored = JSON.parse(raw);
  if (!stored.loginAt) return;

  const elapsed = Math.floor((Date.now() - stored.loginAt) / 1000);
  localStorage.setItem('session_data', JSON.stringify({
    date: stored.date,
    accumulatedSeconds: (stored.accumulatedSeconds || 0) + elapsed,
    firstLoginAt: stored.firstLoginAt,
    loginAt: null, // session ended
  }));
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('hr_portal_user');
    if (stored) {
      setUser(JSON.parse(stored));
      markLoginTime(); // resume tracking on page refresh
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string, remember: boolean): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    const found = MOCK_USERS.find(u => u.email === email);
    if (found) {
      setUser(found);
      if (remember) localStorage.setItem('hr_portal_user', JSON.stringify(found));
      markLoginTime();
      return true;
    }
    return false;
  };

  const logout = () => {
    markLogoutTime();
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