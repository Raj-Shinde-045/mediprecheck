import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, LogOut, User } from 'lucide-react';
import { Button } from '../ui/Button';

export function Navbar({ userRole, onLogout }) {
  const navigate = useNavigate();

  return (
    <nav className="glass sticky top-0 z-50 w-full border-b px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">MediPreCheck</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          {userRole ? (
            <>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mr-4">
                <User className="h-4 w-4" />
                <span className="capitalize">{userRole} Portal</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => {
                onLogout();
                navigate('/');
              }}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
              <Button onClick={() => navigate('/register')}>Sign Up</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
