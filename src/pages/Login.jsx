import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import toast from 'react-hot-toast';
import { Shield, Eye, EyeOff } from 'lucide-react';
import LOGO_BASE64 from '../utils/zkLogoBase64.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Both fields are required');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Terminal Access Granted');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Invalid email or password'
        : err.code === 'auth/user-not-found'
        ? 'Account not found'
        : err.code === 'auth/too-many-requests'
        ? 'Too many attempts. Try again later.'
        : err.message || 'Authentication failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center p-6 relative overflow-hidden font-body">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-pink-900/20 rounded-full blur-[100px] pointer-events-none z-0" />

      <GlassCard elevated className="w-full max-w-md z-10 p-8 border border-white/10 relative overflow-hidden" delay={0.2}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-cyan-400/5 border border-cyan-400/20 flex items-center justify-center overflow-hidden">
            <img src={LOGO_BASE64} alt="Zentrix Logo" className="w-[85%] h-[85%] object-contain" />
          </div>
          <h2 className="text-3xl font-black font-display tracking-widest text-white uppercase text-glow-cyan mb-1">
            Zentrix <span className="text-cyan-400 font-light">OS</span>
          </h2>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]">
            Restricted Access Environment
          </p>
        </div>

        {/* Login Form — NO registration/invite tab */}
        <form onSubmit={handleLogin} className="space-y-4 animate-fade-up">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Agent Identity (Email)
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full input-glass rounded-xl px-4 py-3 text-sm transition-all"
              placeholder="sahil@zentrixesports.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Security Key (Password)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full input-glass rounded-xl px-4 py-3 pr-12 text-sm transition-all text-cyan-400"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <NeonButton type="submit" className="w-full" variant="primary" disabled={loading}>
              {loading ? 'Authenticating...' : 'INITIALIZE UPLINK'}
            </NeonButton>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
            Accounts are issued by Zentrix Operations.
          </p>
          <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest mt-1">
            No self-registration available.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
