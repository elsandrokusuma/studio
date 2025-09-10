
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
    onAuthStateChanged, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut,
    deleteUser,
    type User
} from 'firebase/auth';
import { firebaseEnabled, auth } from '@/lib/firebase';
import { FullPageSpinner } from '@/components/full-page-spinner';
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    if (!auth) {
        console.error("Auth service is not available.");
        toast({
          variant: "destructive",
          title: "Firebase not configured",
          description: "Could not connect to authentication services.",
        });
        return;
    }
    
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      toast({
        title: "Account Connected",
        description: "You've successfully signed in with Google.",
      });
    } catch (error) {
      console.error("Error signing in with Google", error);
       toast({
        variant: "destructive",
        title: "Sign-in Failed",
        description: "There was a problem connecting your Google account.",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const deleteAccount = async () => {
    if (!auth) throw new Error("Firebase not enabled.");
    
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No user is signed in to delete.");
    
    try {
      await deleteUser(currentUser);
      setUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
  
  const value = { user, loading, signIn, signOut: signOutUser, deleteAccount };
  
  if(loading) {
    return <FullPageSpinner />;
  }


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
