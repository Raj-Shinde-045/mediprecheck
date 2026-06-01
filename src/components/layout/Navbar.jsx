import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="glass sticky top-0 z-50 w-full border-b border-white/10 px-6 py-4 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-center">
        <Link to="/" className="flex items-center space-x-3 transition-transform hover:scale-105">
          <div className="bg-primary/20 p-2 rounded-xl">
            <Activity className="h-7 w-7 text-primary" />
          </div>
          <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
            MediPreCheck
          </span>
        </Link>
      </div>
    </nav>
  );
}
