import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { api } from '../lib/api';
import { User } from '../types/user';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  firebaseUser: null, 
  user: null, 
  loading: true 
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log('[Auth] onAuthStateChanged:', fbUser ? { uid: fbUser.uid, email: fbUser.email } : null);
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          console.log('[Auth] ID token acquired:', token ? 'yes' : 'no');
          const userData = await api.get<User>('/users/me');
          console.log('[Auth] /users/me response:', userData);
          setUser(userData);
        } catch (error) {
          console.error('[Auth] Failed to fetch user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
