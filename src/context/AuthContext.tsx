'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role } from '@prisma/client';
import { UserSession, DEMO_USERS } from '@/lib/auth';

interface AuthContextType {
  user: UserSession | null;
  role: Role;
  isLoading: boolean;
  switchRole: (roleKey: 'admin' | 'manager' | 'data_entry' | 'viewer') => void;
  setUser: (user: UserSession | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Default to field staff (data_entry) to emphasize the mobile-first farm staff experience
  const [user, setUser] = useState<UserSession | null>(DEMO_USERS.data_entry);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved session in localStorage
    const savedUserKey = localStorage.getItem('rbcl_active_user_role');
    if (savedUserKey && DEMO_USERS[savedUserKey]) {
      setUser(DEMO_USERS[savedUserKey]);
    } else {
      setUser(DEMO_USERS.data_entry);
    }
    setIsLoading(false);
  }, []);

  const switchRole = (roleKey: 'admin' | 'manager' | 'data_entry' | 'viewer') => {
    const selected = DEMO_USERS[roleKey];
    if (selected) {
      setUser(selected);
      localStorage.setItem('rbcl_active_user_role', roleKey);
      // Also store cookie so server actions know the role if needed
      document.cookie = `rbcl_role=${selected.role}; path=/; max-age=86400`;
    }
  };

  const logout = () => {
    setUser(DEMO_USERS.viewer);
    localStorage.setItem('rbcl_active_user_role', 'viewer');
    document.cookie = `rbcl_role=VIEWER; path=/; max-age=86400`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : Role.VIEWER,
        isLoading,
        switchRole,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
