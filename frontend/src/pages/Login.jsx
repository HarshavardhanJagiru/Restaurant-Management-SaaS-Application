import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Key, Mail, ShieldAlert, Check } from 'lucide-react';
import API from '../services/api';

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Auto-fill based on "role" query param (admin, waiter, kitchen)
  useEffect(() => {
    const role = searchParams.get('role');
    if (role) fillCredentials(role);
  }, [searchParams]);

  useEffect(() => {
    // If already logged in, redirect
    if (user) {
      if (user.role === 'kitchen_staff') {
        navigate('/kitchen');
      } else if (user.role === 'waiter') {
        navigate('/orders');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please provide email and password');
    }
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'kitchen_staff') {
        navigate('/kitchen');
      } else if (loggedUser.role === 'waiter') {
        navigate('/orders');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@restaurant.com');
      setPassword('admin123');
    } else if (role === 'waiter') {
      setEmail('waiter@restaurant.com');
      setPassword('waiter123');
    } else if (role === 'kitchen') {
      setEmail('kitchen@restaurant.com');
      setPassword('kitchen123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-darkBg px-4 relative overflow-hidden">
      {/* Abstract Glowing Orb Details */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md p-8 rounded-2xl glass-panel relative z-10 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/20 mb-4 glow-border">
            <LogIn className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Welcome back
          </h2>
          <p className="text-sm text-slate-400 mt-1">Sign in to manage your restaurant operations</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-3 text-rose-300 text-sm animate-shake">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@restaurant.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/60 border border-darkBorder focus:border-indigo-500 focus:outline-none text-sm font-medium text-slate-200 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Key className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/60 border border-darkBorder focus:border-indigo-500 focus:outline-none text-sm font-medium text-slate-200 transition-colors"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg hover:shadow-indigo-500/10 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Testing Badges */}
        <div className="mt-8 pt-6 border-t border-darkBorder text-center">
          <p className="text-xs text-slate-400 font-semibold mb-3">Quick Login (Development Only)</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => fillCredentials('admin')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-500/10 hover:text-indigo-300 border border-darkBorder hover:border-indigo-500/30 text-xs font-medium text-slate-300 transition-all cursor-pointer"
            >
              Admin
            </button>
            <button
              onClick={() => fillCredentials('waiter')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-500/10 hover:text-indigo-300 border border-darkBorder hover:border-indigo-500/30 text-xs font-medium text-slate-300 transition-all cursor-pointer"
            >
              Waiter
            </button>
            <button
              onClick={() => fillCredentials('kitchen')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-500/10 hover:text-indigo-300 border border-darkBorder hover:border-indigo-500/30 text-xs font-medium text-slate-300 transition-all cursor-pointer"
            >
              Kitchen
            </button>
          </div>
          
          <button
            onClick={async () => {
              try {
                setLoading(true);
                await API.get('/seed');
                alert('Database seeded! Credentials:\n• Admin: admin@restaurant.com / admin123\n• Waiter: waiter@restaurant.com / waiter123\n• Kitchen: kitchen@restaurant.com / kitchen123');
              } catch (e) {
                alert('Error seeding: ' + (e.response?.data?.message || e.message));
              } finally {
                setLoading(false);
              }
            }}
            className="mt-4 text-[11px] font-bold text-indigo-400 hover:underline"
          >
            Click here to seed default DB users & menu data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
