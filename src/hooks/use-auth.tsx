
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
import { useNotifications } from './use-notifications';
import { LogIn, LogOut } from 'lucide-react';
import { useTheme } from './use-theme';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const translations = {
  en: {
    invalidEmail: "The email address is not valid.",
    userDisabled: "This user account has been disabled.",
    userNotFound: "No user found with this email.",
    wrongPassword: "Incorrect password. Please try again.",
    emailInUse: "This email address is already in use.",
    weakPassword: "The password is too weak. Please use a stronger password.",
    authFailed: "Authentication Failed",
    unexpectedError: "An unexpected error occurred.",
    signInSuccess: "Sign In Successful",
    welcomeBack: "Welcome back!",
    signOutSuccess: "Signed Out",
    signOutDesc: "You have been successfully signed out.",
    signOutFailed: "Sign Out Failed",
    signOutFailedDesc: "There was a problem signing out.",
  },
  id: {
    invalidEmail: "Alamat email tidak valid.",
    userDisabled: "Akun pengguna ini telah dinonaktifkan.",
    userNotFound: "Tidak ada pengguna yang ditemukan dengan email ini.",
    wrongPassword: "Kata sandi salah. Silakan coba lagi.",
    emailInUse: "Alamat email ini sudah digunakan.",
    weakPassword: "Kata sandi terlalu lemah. Silakan gunakan kata sandi yang lebih kuat.",
    authFailed: "Autentikasi Gagal",
    unexpectedError: "Terjadi kesalahan yang tidak terduga.",
    signInSuccess: "Berhasil Masuk",
    welcomeBack: "Selamat datang kembali!",
    signOutSuccess: "Berhasil Keluar",
    signOutDesc: "Anda telah berhasil keluar.",
    signOutFailed: "Gagal Keluar",
    signOutFailedDesc: "Terjadi masalah saat keluar.",
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<Auth | null>(null);
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const router = useRouter();
  // We need to get the language from the theme context to show translated toasts
  // Since this provider wraps the ThemeProvider, we'll manage a local language state
  // that syncs with the one from useTheme when available.
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const themeContext = useTheme();

  useEffect(() => {
    if (themeContext?.language) {
      setLanguage(themeContext.language);
    }
  }, [themeContext?.language]);
  
  const t = language === 'id' ? translations.id : translations.en;

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
    let description = t.unexpectedError;
    switch (error.code) {
        case 'auth/invalid-email':
            description = t.invalidEmail;
            break;
        case 'auth/user-disabled':
            description = t.userDisabled;
            break;
        case 'auth/user-not-found':
            description = t.userNotFound;
            break;
        case 'auth/wrong-password':
            description = t.wrongPassword;
            break;
        case 'auth/email-already-in-use':
            description = t.emailInUse;
            break;
        case 'auth/weak-password':
            description = t.weakPassword;
            break;
        default:
            description = error.message;
            break;
    }
    toast({
        variant: "destructive",
        title: t.authFailed,
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
        addNotification({
            title: t.signInSuccess,
            description: t.welcomeBack,
            icon: LogIn,
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
      addNotification({
          title: t.signOutSuccess,
          description: t.signOutDesc,
          icon: LogOut,
      });
      router.push('/');
    } catch (error) {
      console.error("Error signing out", error);
      toast({
          variant: "destructive",
          title: t.signOutFailed,
          description: t.signOutFailedDesc,
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
