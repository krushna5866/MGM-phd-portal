import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import api from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, ShieldCheck, GraduationCap, UserCheck, Settings, Briefcase, UserPlus, Eye, EyeOff, Building, BookOpen, Scroll } from 'lucide-react';

export default function Login() {
  const [viewMode, setViewMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [errorStatus, setErrorStatus] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(true);

  React.useEffect(() => {
    api.get('/settings/')
      .then(res => setIsAdmissionOpen(res.data.admission_window_open))
      .catch(console.error);
  }, []);

  React.useEffect(() => {
    if (!isAdmissionOpen && role === 'STUDENT') {
      setRole('FACULTY');
    }
  }, [isAdmissionOpen, role]);
  
  const { login, register, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus('');
    try {
      if (viewMode === 'login') {
        await login(email, password);
        navigate('/dashboard');
      } else if (viewMode === 'register') {
        await register(name, email, password, role);
        navigate('/dashboard');
      } else if (viewMode === 'forgot') {
        await resetPassword(email, password);
        setViewMode('login');
        setErrorStatus('');
        alert('Password reset successfully! Please login with your new password.');
      }
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setErrorStatus(error.response.data.detail);
      } else {
        setErrorStatus('An error occurred. Please try again.');
      }
    }
  };

  const roles: { id: UserRole; label: string; icon: React.ReactNode }[] = [
    { id: 'STUDENT', label: 'Student', icon: <GraduationCap className="h-4 w-4" /> },
    { id: 'FACULTY', label: 'Faculty', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'COORDINATOR', label: 'Ph.D. Coord', icon: <Settings className="h-4 w-4" /> },
    { id: 'HOD', label: 'HoD', icon: <Building className="h-4 w-4" /> },
    { id: 'DEAN', label: 'Dean', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'REGISTRAR', label: 'Registrar', icon: <Scroll className="h-4 w-4" /> },
    { id: 'DEPUTY_REGISTRAR', label: 'Dy. Registrar', icon: <Scroll className="h-4 w-4" /> },
    { id: 'VICE_CHANCELLOR', label: 'Vice Chancellor', icon: <ShieldCheck className="h-4 w-4" /> },
    { id: 'COE', label: 'CoE', icon: <ShieldCheck className="h-4 w-4" /> },
    { id: 'BUTR', label: 'BUTR', icon: <UserCheck className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-mgmu-light py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-mgmu-blue rounded-full flex items-center justify-center mb-4 text-white">
            <AnimatePresence mode="wait">
                <motion.div key={viewMode}
                  initial={{ opacity: 0, rotate: 90 }} 
                  animate={{ opacity: 1, rotate: 0 }} 
                  exit={{ opacity: 0, rotate: -90 }}
                >
                  {viewMode === 'login' ? <LogIn className="h-8 w-8 text-mgmu-gold" /> : 
                   viewMode === 'register' ? <UserPlus className="h-8 w-8 text-mgmu-gold" /> : 
                   <ShieldCheck className="h-8 w-8 text-mgmu-gold" />}
                </motion.div>
            </AnimatePresence>
          </div>
          <h2 className="text-3xl font-extrabold text-mgmu-blue">
            {viewMode === 'login' ? 'Portal Login' : 
             viewMode === 'register' ? 'Create Account' : 
             'Reset Password'}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {viewMode === 'login' ? 'Select your role and enter credentials' : 
             viewMode === 'register' ? 'Register a new account' : 
             'Enter your email and a new password'}
          </p>
        </div>

        {errorStatus && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center border border-red-200">
            {errorStatus}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Role Selection is only for Registration currently. Standardizing it so backend login logic matches (or role is inferred via backend) */}
            {viewMode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Role</label>
                {!isAdmissionOpen && (
                  <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm mb-3 border border-yellow-200">
                    <strong>Notice:</strong> The Ph.D. Admission Window is currently closed. New student registrations are not permitted.
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {roles.filter(r => isAdmissionOpen || r.id !== 'STUDENT').map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                        role === r.id 
                          ? 'border-mgmu-blue bg-mgmu-blue/5 text-mgmu-blue ring-2 ring-mgmu-blue/20' 
                          : 'border-gray-200 hover:border-mgmu-gold text-gray-600'
                      }`}
                    >
                      <span className={role === r.id ? 'text-mgmu-gold' : 'text-gray-400'}>{r.icon}</span>
                      <span className="font-medium">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'register' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-mgmu-blue focus:border-mgmu-blue sm:text-sm"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                id="email-address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-mgmu-blue focus:border-mgmu-blue sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-mgmu-blue focus:border-mgmu-blue sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-mgmu-blue"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-mgmu-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mgmu-blue transition-all"
            >
              {viewMode === 'login' ? 'Sign In' : 
               viewMode === 'register' ? 'Create Account' : 
               'Reset Password'}
            </button>
          </div>

          <div className="text-center flex flex-col space-y-2">
            {viewMode === 'login' && (
              <button 
                type="button"
                onClick={() => {
                  setViewMode('forgot');
                  setErrorStatus('');
                }}
                className="text-sm font-medium text-gray-500 hover:text-mgmu-gold transition-colors"
              >
                Forgot your password?
              </button>
            )}
            <button 
              type="button"
              onClick={() => {
                setViewMode(viewMode === 'login' ? 'register' : 'login');
                setErrorStatus('');
              }}
              className="text-sm font-medium text-gray-600 hover:text-mgmu-blue transition-colors mt-2"
            >
              {viewMode === 'login' ? "Don't have an account? Register" : "Back to Sign In"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
