import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  KeyRound
} from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToHome
}) => {
  const { login, language } = useAuth();
  const [identifier, setIdentifier] = useState('admin@emitra.rajasthan.gov.in');
  const [password, setPassword] = useState('Admin@Emitra2026!');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const result = await login(identifier, password, 'admin');
    setIsLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setErrorMsg(result.message || 'Invalid administrator credentials');
    }
  };

  const fillDefaultCredentials = () => {
    setIdentifier('admin@emitra.rajasthan.gov.in');
    setPassword('Admin@Emitra2026!');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <button
          onClick={onBackToHome}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'hi' ? 'नागरिक पोर्टल पर वापस जाएं' : 'Back to Citizen Portal'}</span>
        </button>

        {/* Brand Crest */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-amber-600 mx-auto flex items-center justify-center p-1 shadow-xl shadow-blue-950/50">
            <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            eMitra Admin Control Panel
          </h2>
          <p className="text-xs text-blue-200">
            Secure administrative access for Rajasthan eMitra Operations
          </p>
        </div>

        {/* Credentials Form Card */}
        <div className="mt-8 bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 rounded-2xl shadow-2xl border border-white/20">
          {/* Quick Demo Credentials Info Banner */}
          <div className="mb-6 p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 flex-1">
              <p className="font-bold">System Admin Access</p>
              <p className="text-[11px] text-amber-800">
                Email: <code className="bg-amber-100 px-1 py-0.5 rounded">admin@emitra.rajasthan.gov.in</code>
                <br />
                Password: <code className="bg-amber-100 px-1 py-0.5 rounded">Admin@Emitra2026!</code>
              </p>
              <button
                type="button"
                onClick={fillDefaultCredentials}
                className="mt-1.5 text-[11px] font-bold text-blue-800 underline hover:text-blue-950"
              >
                Auto-fill credentials
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Username / Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="admin@emitra.rajasthan.gov.in"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 disabled:opacity-50 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span>Verifying Authentication...</span>
              ) : (
                <>
                  <span>Sign In to Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-[11px] text-slate-400">
            Protected by 256-Bit SHA Encryption & Role-Based Authorization
          </div>
        </div>
      </div>
    </div>
  );
};
