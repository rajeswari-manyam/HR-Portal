import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    User, Mail, Lock, Phone, Briefcase, Building2,
    Hash, Calendar, ShieldCheck, Eye, EyeOff, Loader2,
    CheckCircle2, ArrowRight, ChevronDown
} from 'lucide-react';
import { registerUser } from "../../service/auth.service";
import { DEPARTMENT_DATA, getRolesByDepartment } from "../../data/department";

const ROLES = ['employee', 'hr'];

const DEFAULT_VALUES = {
    employeeId: '',
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    designation: '',
    phone: '',
    joinDate: new Date().toISOString().slice(0, 10),
};

export default function Register() {
    const navigate = useNavigate();
    const { completeRegistration } = useAuth();

    const [form, setForm] = useState(DEFAULT_VALUES);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ✅ Roles filtered by selected department
    const availableRoles = getRolesByDepartment(form.department);

    const set = (field: string, value: string) => {
        setForm(prev => {
            const next = { ...prev, [field]: value };
            // ✅ Reset designation when department changes
            if (field === 'department') next.designation = '';
            return next;
        });
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const getStrength = (p: string) => {
        let score = 0;
        if (p.length >= 8) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        return score;
    };
    const strength = getStrength(form.password);
    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
    const strengthColor = ['', 'bg-red-500', 'bg-yellow-400', 'bg-blue-400', 'bg-emerald-400'][strength];
    const strengthText = ['', 'text-red-400', 'text-yellow-400', 'text-blue-400', 'text-emerald-400'][strength];

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.employeeId.trim()) e.employeeId = 'Employee ID is required';
        if (!form.name.trim()) e.name = 'Name is required';
        if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Invalid email address';
        if (form.password.length < 8) e.password = 'At least 8 characters required';
        if (form.password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
        if (!form.phone.match(/^\d{10}$/)) e.phone = 'Must be a 10-digit number';
        if (!form.joinDate) e.joinDate = 'Join date is required';
        if (!form.department) e.department = 'Department is required';
        if (!form.designation) e.designation = 'Designation is required';
        return e;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setLoading(true);

        try {
            const payload = {
                employeeId: form.employeeId,
                password: form.password,
                name: form.name,
                email: form.email,
                role: form.role,
                department: form.department,
                designation: form.designation,
                phone: form.phone,
                joinDate: form.joinDate
            };

            const response = await registerUser(payload);
            console.log("Register Success:", response);
            completeRegistration();
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000);

        } catch (error: any) {
            console.error("Register Error:", error);
            setErrors({ email: "Registration failed. Try again." });
        } finally {
            setLoading(false);
        }
    };

    const inputBase = (field: string) =>
        `w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/70 border placeholder:text-slate-600 outline-none transition-all
        focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50
        ${errors[field] ? 'border-red-500/60 bg-red-500/5' : 'border-slate-700/60 hover:border-slate-600'}`;

    const selectBase =
        `w-full pl-10 pr-8 py-2.5 rounded-xl text-sm text-white bg-slate-800/70 border border-slate-700/60
        hover:border-slate-600 outline-none transition-all appearance-none cursor-pointer
        focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50`;

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 border-2 border-emerald-400/40 rounded-full mb-5">
                        <CheckCircle2 size={38} className="text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">Account Created!</h2>
                    <p className="text-slate-400 text-sm">Redirecting to sign in...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-y-auto">
            {/* Fixed decorative blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-600/15 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
            </div>

            {/* Scrollable layout */}
            <div className="relative flex justify-center py-10 px-4">
                <div className="w-full max-w-2xl">

                    {/* Logo / Header */}
                    <div className="text-center mb-7">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-3 shadow-lg shadow-primary-600/30">
                            <span className="text-white font-black text-xl">W</span>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">WorkForce Pro</h1>
                        <p className="text-slate-400 mt-1 text-sm">Create your employee account to get started</p>
                    </div>

                    {/* Form card */}
                    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl">

                        {/* Card top bar */}
                        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-700/50">
                            <h2 className="text-lg font-bold text-white">Employee Registration</h2>
                            <span className="text-xs text-primary-400 bg-primary-500/10 border border-primary-500/20 px-3 py-1 rounded-full font-medium tracking-wide">
                                New Account
                            </span>
                        </div>

                        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-8">

                            {/* ── Personal Information ── */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <User size={12} className="text-primary-400" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Personal Information</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                    {/* Employee ID */}
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-300">Employee ID</label>
                                        <div className="relative">
                                            <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                            <input type="text" value={form.employeeId} onChange={e => set('employeeId', e.target.value)}
                                                placeholder="e.g. EMP001" autoComplete="off" className={inputBase('employeeId')} />
                                        </div>
                                        {errors.employeeId && <p className="text-red-400 text-xs">{errors.employeeId}</p>}
                                    </div>

                                    {/* Full Name */}
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-300">Full Name</label>
                                        <div className="relative">
                                            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                            <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                                                placeholder="Your full name" autoComplete="off" className={inputBase('name')} />
                                        </div>
                                        {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-300">Email Address</label>
                                        <div className="relative">
                                            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                                                placeholder="you@company.com" autoComplete="off" className={inputBase('email')} />
                                        </div>
                                        {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-300">Phone Number</label>
                                        <div className="relative">
                                            <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                                                placeholder="10-digit number" maxLength={10} autoComplete="off" className={inputBase('phone')} />
                                        </div>
                                        {errors.phone && <p className="text-red-400 text-xs">{errors.phone}</p>}
                                    </div>

                                </div>
                            </section>

                            <div className="border-t border-slate-700/40" />

                            {/* ── Work Information ── */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Briefcase size={12} className="text-violet-400" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Work Information</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                    {/* Role */}
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-300">Role</label>
                                        <div className="relative">
                                            <ShieldCheck size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10" />
                                            <select value={form.role} onChange={e => set('role', e.target.value)} className={selectBase}>
                                                {ROLES.map(r => (
                                                    <option key={r} value={r} className="bg-slate-800">
                                                        {r.charAt(0).toUpperCase() + r.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* ✅ Department — from department.ts */}
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-300">Department</label>
                                        <div className="relative">
                                            <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10" />
                                            <select
                                                value={form.department}
                                                onChange={e => set('department', e.target.value)}
                                                className={`${selectBase} ${errors.department ? 'border-red-500/60' : ''}`}
                                            >
                                                <option value="" className="bg-slate-800">Select Department</option>
                                                {DEPARTMENT_DATA.map(d => (
                                                    <option key={d.id} value={d.name} className="bg-slate-800">{d.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                        </div>
                                        {errors.department && <p className="text-red-400 text-xs">{errors.department}</p>}
                                    </div>

                                    {/* ✅ Designation — filtered by selected department */}
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-300">Designation</label>
                                        <div className="relative">
                                            <Briefcase size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10" />
                                            <select
                                                value={form.designation}
                                                onChange={e => set('designation', e.target.value)}
                                                disabled={!form.department}
                                                className={`${selectBase} ${errors.designation ? 'border-red-500/60' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                <option value="" className="bg-slate-800">
                                                    {form.department ? 'Select Designation' : 'Select Department first'}
                                                </option>
                                                {availableRoles.map(role => (
                                                    <option key={role} value={role} className="bg-slate-800">{role}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                        </div>
                                        {errors.designation && <p className="text-red-400 text-xs">{errors.designation}</p>}
                                        {form.department && (
                                            <p className="text-xs text-slate-600">
                                                {availableRoles.length} roles available in {form.department}
                                            </p>
                                        )}
                                    </div>

                                    {/* Join Date */}
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-300">Join Date</label>
                                        <div className="relative">
                                            <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10" />
                                            <input
                                                type="date"
                                                value={form.joinDate}
                                                onChange={e => set('joinDate', e.target.value)}
                                                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white bg-slate-800/70 border outline-none transition-all [color-scheme:dark]
                                                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50
                                                    ${errors.joinDate ? 'border-red-500/60' : 'border-slate-700/60 hover:border-slate-600'}`}
                                            />
                                        </div>
                                        {errors.joinDate && <p className="text-red-400 text-xs">{errors.joinDate}</p>}
                                    </div>

                                </div>
                            </section>

                            <div className="border-t border-slate-700/40" />

                            {/* ── Security ── */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Lock size={12} className="text-emerald-400" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Security</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                    {/* Password */}
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-300">Password</label>
                                        <div className="relative">
                                            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                            <input
                                                type={showPass ? 'text' : 'password'}
                                                value={form.password}
                                                onChange={e => set('password', e.target.value)}
                                                placeholder="Create a strong password"
                                                autoComplete="new-password"
                                                className={`w-full pl-10 pr-11 py-2.5 rounded-xl text-sm text-white bg-slate-800/70 border placeholder:text-slate-600 outline-none transition-all
                                                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50
                                                    ${errors.password ? 'border-red-500/60' : 'border-slate-700/60 hover:border-slate-600'}`}
                                            />
                                            <button type="button" onClick={() => setShowPass(!showPass)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                                                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                        {form.password && (
                                            <div className="space-y-1 pt-0.5">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4].map(i => (
                                                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-slate-700'}`} />
                                                    ))}
                                                </div>
                                                <p className={`text-xs font-semibold ${strengthText}`}>{strengthLabel}</p>
                                            </div>
                                        )}
                                        {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-300">Confirm Password</label>
                                        <div className="relative">
                                            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                            <input
                                                type={showConfirm ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: '' })); }}
                                                placeholder="Re-enter your password"
                                                autoComplete="new-password"
                                                className={`w-full pl-10 pr-11 py-2.5 rounded-xl text-sm text-white bg-slate-800/70 border placeholder:text-slate-600 outline-none transition-all
                                                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50
                                                    ${errors.confirmPassword ? 'border-red-500/60' : 'border-slate-700/60 hover:border-slate-600'}`}
                                            />
                                            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                                                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                            {confirmPassword && form.password === confirmPassword && (
                                                <CheckCircle2 size={14} className="absolute right-10 top-1/2 -translate-y-1/2 text-emerald-400" />
                                            )}
                                        </div>
                                        {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword}</p>}
                                    </div>

                                </div>
                            </section>

                            {/* Submit */}
                            <div className="pt-1">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? <><Loader2 size={17} className="animate-spin" /> Creating Account...</>
                                        : <><span>Create Account</span><ArrowRight size={15} /></>
                                    }
                                </button>

                                <p className="text-center text-sm text-slate-500 mt-4">
                                    Already have an account?{' '}
                                    <button type="button" onClick={() => navigate('/login')}
                                        className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                                        Sign In
                                    </button>
                                </p>
                            </div>

                        </form>
                    </div>

                    <p className="text-center text-xs text-slate-700 mt-6">
                        WorkForce Pro · HR Management Portal
                    </p>
                </div>
            </div>
        </div>
    );
}