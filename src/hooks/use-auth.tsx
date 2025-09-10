
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
    onAuthStateChanged, 
    signOut,
    deleteUser,
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    type Auth,
    type User,
    type AuthError
} from 'firebase/auth';
import { app, firebaseEnabled } from '@/lib/firebase';
import { FullPageSpinner } from '@/components/full-page-spinner';
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<Auth | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (firebaseEnabled && app) {
      const authInstance = getAuth(app);
      setAuth(authInstance);
      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        setUser(user);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuthError = (error: AuthError) => {
    let description = "An unexpected error occurred.";
    switch (error.code) {
        case 'auth/invalid-email':
            description = "The email address is not valid.";
            break;
        case 'auth/user-disabled':
            description = "This user account has been disabled.";
            break;
        case 'auth/user-not-found':
            description = "No user found with this email.";
            break;
        case 'auth/wrong-password':
            description = "Incorrect password. Please try again.";
            break;
        case 'auth/email-already-in-use':
            description = "This email address is already in use.";
            break;
        case 'auth/weak-password':
            description = "The password is too weak. Please use a stronger password.";
            break;
        default:
            description = error.message;
            break;
    }
    toast({
        variant: "destructive",
        title: "Authentication Failed",
        description,
    });
    throw error;
  };

  const signIn = async (email: string, pass: string) => {
    if (!auth) throw new Error("Auth service not initialized.");
    setLoading(true);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        setUser(userCredential.user);
        toast({
            title: "Sign In Successful",
            description: "Welcome back!",
        });
    } catch (error: any) {
        handleAuthError(error);
    } finally {
        setLoading(false);
    }
  };


  const signOutUser = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
      });
      router.push('/');
    } catch (error) {
      console.error("Error signing out", error);
      toast({
          variant: "destructive",
          title: "Sign Out Failed",
          description: "There was a problem signing out.",
      });
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
  
  if(loading && !user) {
    // Show spinner only on initial load when user status is unknown
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
