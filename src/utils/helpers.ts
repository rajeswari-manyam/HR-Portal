import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    // existing lowercase keys
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-slate-100 text-slate-600',
    present: 'bg-emerald-100 text-emerald-700',
    absent: 'bg-red-100 text-red-700',
    late: 'bg-amber-100 text-amber-700',
    'half-day': 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    open: 'bg-emerald-100 text-emerald-700',
    closed: 'bg-slate-100 text-slate-600',
    draft: 'bg-blue-100 text-blue-700',
    generated: 'bg-emerald-100 text-emerald-700',
    applied: 'bg-blue-100 text-blue-700',
    screening: 'bg-purple-100 text-purple-700',
    interview: 'bg-amber-100 text-amber-700',
    offer: 'bg-cyan-100 text-cyan-700',
    hired: 'bg-emerald-100 text-emerald-700',
    reviewed: 'bg-emerald-100 text-emerald-700',
    submitted: 'bg-blue-100 text-blue-700',
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-blue-100 text-blue-700',
    critical: 'bg-red-100 text-red-700',
    // task statuses
    'to do': 'bg-gray-100 text-gray-600',
    'in progress': 'bg-blue-100 text-blue-600',
    review: 'bg-indigo-100 text-indigo-600',
    // task tags
    frontend: 'bg-blue-100 text-blue-600',
    'design system': 'bg-purple-100 text-purple-600',
    ux: 'bg-pink-100 text-pink-600',
    backend: 'bg-orange-100 text-orange-600',
    api: 'bg-yellow-100 text-yellow-700',
    qa: 'bg-teal-100 text-teal-600',
    a11y: 'bg-green-100 text-green-600',
    docs: 'bg-gray-100 text-gray-600',
    // project statuses (title-case)
    overdue: 'bg-red-100 text-red-700',
    completed: 'bg-sky-100 text-sky-700',
    planning: 'bg-violet-100 text-violet-700',
    'on hold': 'bg-amber-100 text-amber-700',
  };
  return map[status.toLowerCase()] || 'bg-slate-100 text-slate-600';
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
