import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithOtp: (contact: string) => Promise<{ error: Error | null }>;
  verifyOtp: (contact: string, token: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithOtp = async (contact: string) => {
    const isEmail = contact.includes('@');
    if (isEmail) {
      const { error } = await supabase.auth.signInWithOtp({ email: contact });
      return { error: error as Error | null };
    } else {
      const { error } = await supabase.auth.signInWithOtp({ phone: contact });
      return { error: error as Error | null };
    }
  };

  const verifyOtp = async (contact: string, token: string) => {
    const isEmail = contact.includes('@');
    if (isEmail) {
      const { error } = await supabase.auth.verifyOtp({ email: contact, token, type: 'email' });
      return { error: error as Error | null };
    } else {
      const { error } = await supabase.auth.verifyOtp({ phone: contact, token, type: 'sms' });
      return { error: error as Error | null };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signInWithOtp, verifyOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
