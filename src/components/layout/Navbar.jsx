import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Sparkles, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className="glass sticky top-0 z-50 w-full border-b border-white/5 px-6 py-4 bg-background/50 backdrop-blur-2xl shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-3 transition-transform hover:scale-[1.02] active:scale-95 group">
          <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(0,200,255,0.15)] group-hover:shadow-[0_0_20px_rgba(0,200,255,0.3)] transition-all">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <span className="text-2xl font-black font-heading tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 group-hover:to-primary transition-all duration-300">
            MediPreCheck
          </span>
        </Link>

        {/* Right Side Info */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-primary/5 border border-primary/10 px-4 py-2 rounded-full shadow-inner">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,200,255,0.8)]" />
            <span className="text-xs font-bold text-primary tracking-widest uppercase flex items-center gap-1.5">
              Clinic Core Active <Sparkles className="w-3 h-3" />
            </span>
          </div>

          {currentUser && (
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
              <div className="flex flex-col items-end mr-4">
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <User className="w-4 h-4 text-muted-foreground" /> {currentUser.email}
                </span>
                <span className="text-xs font-medium text-primary uppercase tracking-widest">
                  Clinic Admin
                </span>
              </div>
              <Link 
                to="/settings"
                className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-xl border border-white/10 transition-all hover:scale-105 active:scale-95"
                title="Settings"
              >
                <SettingsIcon className="w-5 h-5" />
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-xl border border-red-500/20 transition-all hover:scale-105 active:scale-95"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
