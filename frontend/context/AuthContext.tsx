import React, { createContext, useContext, useMemo, useState } from 'react';

type AuthContextType = {
  user: null | { id: string; name: string };
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<null | { id: string; name: string }>(null);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      login: async () => {
        setUser({ id: 'demo-user', name: 'Demo User' });
      },
      register: async () => {
        setUser({ id: 'demo-user', name: 'Demo User' });
      },
      logout: async () => {
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}
