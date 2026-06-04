import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useTheme } from '../../contexts/ThemeContext';

export function AppLayout() {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Decorative background blurs for a premium look */}
      <div className="hidden md:block absolute top-0 -left-4 w-72 h-72 bg-primary/30 dark:bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-90 dark:opacity-70 animate-blob pointer-events-none"></div>
      <div className="hidden md:block absolute top-0 -right-4 w-72 h-72 bg-blue-300/30 dark:bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-90 dark:opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="hidden md:block absolute -bottom-8 left-20 w-72 h-72 bg-purple-300/30 dark:bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-90 dark:opacity-70 animate-blob animation-delay-4000 pointer-events-none"></div>

      <Navbar />
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 z-10 relative flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-background/50 backdrop-blur-md py-4 z-10 relative mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} MediPreCheck. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
