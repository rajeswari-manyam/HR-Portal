import { createContext, useContext, useState, ReactNode } from 'react';
import { mockLeaveRequests } from '../data/mockData';
import { LeaveRequest } from '../types';

interface LeaveContextType {
  requests: LeaveRequest[];
  addLeave: (leave: LeaveRequest) => void;
  updateStatus: (id: string, status: 'approved' | 'rejected', approvedBy?: string) => void;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export function LeaveProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<LeaveRequest[]>(mockLeaveRequests);

  const addLeave = (leave: LeaveRequest) => {
    setRequests(prev => [leave, ...prev]);
  };

  const updateStatus = (id: string, status: 'approved' | 'rejected', approvedBy = 'Rahul Verma') => {
    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status, approvedBy } : r)
    );
  };

  return (
    <LeaveContext.Provider value={{ requests, addLeave, updateStatus }}>
      {children}
    </LeaveContext.Provider>
  );
}

export function useLeave() {
  const ctx = useContext(LeaveContext);
  if (!ctx) throw new Error('useLeave must be used within LeaveProvider');
  return ctx;
}