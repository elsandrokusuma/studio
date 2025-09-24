
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
import { LoginForm } from '@/components/login-form';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  setLoginModalOpen: (open: boolean) => void;
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
  },
  es: {
    invalidEmail: "La dirección de correo electrónico no es válida.",
    userDisabled: "Esta cuenta de usuario ha sido deshabilitada.",
    userNotFound: "No se encontró ningún usuario con este correo electrónico.",
    wrongPassword: "Contraseña incorrecta. Por favor, inténtalo de nuevo.",
    emailInUse: "Esta dirección de correo electrónico ya está en uso.",
    weakPassword: "La contraseña es demasiado débil. Utilice una contraseña más segura.",
    authFailed: "Autenticación Fallida",
    unexpectedError: "Ocurrió un error inesperado.",
    signInSuccess: "Inicio de Sesión Exitoso",
    welcomeBack: "¡Bienvenido de nuevo!",
    signOutSuccess: "Sesión Cerrada",
    signOutDesc: "Has cerrado sesión correctamente.",
    signOutFailed: "Error al Cerrar Sesión",
    signOutFailedDesc: "Hubo un problema al cerrar la sesión.",
  },
  fr: {
    invalidEmail: "L'adresse e-mail n'est pas valide.",
    userDisabled: "Ce compte utilisateur a été désactivé.",
    userNotFound: "Aucun utilisateur trouvé avec cet e-mail.",
    wrongPassword: "Mot de passe incorrect. Veuillez réessayer.",
    emailInUse: "Cette adresse e-mail est déjà utilisée.",
    weakPassword: "Le mot de passe est trop faible. Veuillez utiliser un mot de passe plus fort.",
    authFailed: "Échec de l'Authentification",
    unexpectedError: "Une erreur inattendue est survenue.",
    signInSuccess: "Connexion Réussie",
    welcomeBack: "Content de vous revoir !",
    signOutSuccess: "Déconnecté",
    signOutDesc: "Vous avez été déconnecté avec succès.",
    signOutFailed: "Échec de la Déconnexion",
    signOutFailedDesc: "Un problème est survenu lors de la déconnexion.",
  },
  de: {
    invalidEmail: "Die E-Mail-Adresse ist ungültig.",
    userDisabled: "Dieses Benutzerkonto wurde deaktiviert.",
    userNotFound: "Kein Benutzer mit dieser E-Mail gefunden.",
    wrongPassword: "Falsches Passwort. Bitte versuchen Sie es erneut.",
    emailInUse: "Diese E-Mail-Adresse wird bereits verwendet.",
    weakPassword: "Das Passwort ist zu schwach. Bitte verwenden Sie ein stärkeres Passwort.",
    authFailed: "Authentifizierung Fehlgeschlagen",
    unexpectedError: "Ein unerwarteter Fehler ist aufgetreten.",
    signInSuccess: "Anmeldung Erfolgreich",
    welcomeBack: "Willkommen zurück!",
    signOutSuccess: "Abgemeldet",
    signOutDesc: "Sie wurden erfolgreich abgemeldet.",
    signOutFailed: "Abmeldung Fehlgeschlagen",
    signOutFailedDesc: "Beim Abmelden ist ein Problem aufgetreten.",
  },
  ja: {
    invalidEmail: "メールアドレスが無効です。",
    userDisabled: "このユーザーアカウントは無効になっています。",
    userNotFound: "このメールアドレスのユーザーが見つかりません。",
    wrongPassword: "パスワードが正しくありません。もう一度お試しください。",
    emailInUse: "このメールアドレスは既に使用されています。",
    weakPassword: "パスワードが弱すぎます。より強力なパスワードを使用してください。",
    authFailed: "認証に失敗しました",
    unexpectedError: "予期しないエラーが発生しました。",
    signInSuccess: "サインインに成功しました",
    welcomeBack: "おかえりなさい！",
    signOutSuccess: "サインアウトしました",
    signOutDesc: "正常にサインアウトしました。",
    signOutFailed: "サインアウトに失敗しました",
    signOutFailedDesc: "サインアウト中に問題が発生しました。",
  },
  ko: {
    invalidEmail: "유효하지 않은 이메일 주소입니다.",
    userDisabled: "이 사용자 계정은 비활성화되었습니다.",
    userNotFound: "이 이메일로 사용자를 찾을 수 없습니다.",
    wrongPassword: "비밀번호가 잘못되었습니다. 다시 시도하십시오.",
    emailInUse: "이 이메일 주소는 이미 사용 중입니다.",
    weakPassword: "비밀번호가 너무 약합니다. 더 강력한 비밀번호를 사용하십시오.",
    authFailed: "인증 실패",
    unexpectedError: "예기치 않은 오류가 발생했습니다.",
    signInSuccess: "로그인 성공",
    welcomeBack: "다시 오신 것을 환영합니다!",
    signOutSuccess: "로그아웃됨",
    signOutDesc: "성공적으로 로그아웃되었습니다.",
    signOutFailed: "로그아웃 실패",
    signOutFailedDesc: "로그아웃하는 동안 문제가 발생했습니다.",
  },
  'zh-CN': {
    invalidEmail: "电子邮件地址无效。",
    userDisabled: "此用户帐户已被禁用。",
    userNotFound: "找不到使用此电子邮件的用户。",
    wrongPassword: "密码不正确。请重试。",
    emailInUse: "此电子邮件地址已在使用中。",
    weakPassword: "密码太弱。请使用更强的密码。",
    authFailed: "认证失败",
    unexpectedError: "发生了意外错误。",
    signInSuccess: "登录成功",
    welcomeBack: "欢迎回来！",
    signOutSuccess: "已退出登录",
    signOutDesc: "您已成功退出登录。",
    signOutFailed: "退出登录失败",
    signOutFailedDesc: "退出登录时出现问题。",
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const router = useRouter();
  const [language, setLanguage] = useState<'id' | 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'zh-CN'>('id');
  const themeContext = useTheme();

  useEffect(() => {
    if (themeContext?.language) {
      setLanguage(themeContext.language);
    }
  }, [themeContext?.language]);
  
  const t = translations[language] || translations.en;

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
        setLoginModalOpen(false); // Close modal on success
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
  
  const value = { user, loading, signIn, signOut: signOutUser, deleteAccount, setLoginModalOpen };

  if (loading) {
    return <FullPageSpinner />;
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
      {isLoginModalOpen && <LoginForm onClose={() => setLoginModalOpen(false)} />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

    