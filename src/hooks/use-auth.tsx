
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut,
    deleteUser,
    type User 
} from 'firebase/auth';
import { db, firebaseEnabled } from '@/lib/firebase';
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
    if (!firebaseEnabled) {
      setLoading(false);
      return;
    }
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    if (!firebaseEnabled) {
        console.error("Firebase is not configured.");
        toast({
          variant: "destructive",
          title: "Firebase not configured",
          description: "Could not connect to authentication services.",
        });
        return;
    }
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      setUser(result.user); // Explicitly set user state after successful sign-in
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
    if (!firebaseEnabled) return;
    const auth = getAuth();
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const deleteAccount = async () => {
    if (!firebaseEnabled) throw new Error("Firebase not enabled.");
    const auth = getAuth();
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

  // Render a loading spinner for the initial auth state check
  if (loading && !firebaseEnabled) {
    // If firebase is disabled, don't show a spinner indefinitely.
    // The initial check will be quick.
  } else if(loading) {
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

