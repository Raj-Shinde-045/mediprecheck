import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { ShieldAlert, LogIn, Building2, Loader2 } from 'lucide-react';

export function AuthPage() {
  const navigate = useNavigate();
  const { login, register, signInWithGoogle } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, clinicName);
      }
      navigate(`/`); // Redirect to Portal Selector Landing Page
    } catch (err) {
      console.error(err);
      setError("Failed to authenticate. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-card overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500" />
          
          <div className="text-center mb-8">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-inner">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-wider mb-2">
              Clinic {isLogin ? 'Login' : 'Portal'}
            </h2>
            <p className="text-muted-foreground text-sm font-medium">
              Secure Central Access Node
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-bold animate-pulse">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Clinic Name</label>
                <input 
                  type="text" 
                  required 
                  className="input-field" 
                  value={clinicName} 
                  onChange={(e) => setClinicName(e.target.value)} 
                  placeholder="City Health Center"
                />
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
              <input 
                type="email" 
                required 
                className="input-field" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="admin@clinic.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
              <input 
                type="password" 
                required 
                className="input-field" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all shadow-lg text-foreground dark:text-white bg-primary hover:bg-blue-500 shadow-primary/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? <><LogIn className="w-5 h-5" /> Authenticate</> : <><Building2 className="w-5 h-5" /> Initialize Clinic</>}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-bold tracking-widest">Or continue with</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={async () => {
                try {
                  setLoading(true);
                  setError('');
                  await signInWithGoogle();
                  navigate('/');
                } catch (err) {
                  console.error(err);
                  setError("Google authentication failed.");
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full mt-6 h-12 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all border border-foreground/10 dark:border-white/10 bg-foreground/5 dark:bg-white/5 hover:bg-foreground/10 dark:hover:bg-white/10 text-foreground dark:text-white"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              type="button"
              className="text-sm font-bold text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors underline underline-offset-4"
            >
              {isLogin ? "Register a new Clinic?" : "Already registered? Authenticate"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
