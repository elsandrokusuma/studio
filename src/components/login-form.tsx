
'use client';

import * as React from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

const translations = {
    en: {
        title: "Welcome!",
        description: "Please sign in to continue to your dashboard.",
        emailLabel: "Email",
        passwordLabel: "Password",
        signInButton: "Sign In"
    },
    id: {
        title: "Selamat Datang!",
        description: "Silakan masuk untuk melanjutkan ke dashboard Anda.",
        emailLabel: "Email",
        passwordLabel: "Kata Sandi",
        signInButton: "Masuk"
    },
    es: {
        title: "¡Bienvenido!",
        description: "Inicia sesión para continuar a tu panel.",
        emailLabel: "Correo Electrónico",
        passwordLabel: "Contraseña",
        signInButton: "Iniciar Sesión"
    },
    fr: {
        title: "Bienvenue !",
        description: "Veuillez vous connecter pour continuer vers votre tableau de bord.",
        emailLabel: "E-mail",
        passwordLabel: "Mot de passe",
        signInButton: "Se connecter"
    },
    de: {
        title: "Willkommen!",
        description: "Bitte melden Sie sich an, um zu Ihrem Dashboard zu gelangen.",
        emailLabel: "E-Mail",
        passwordLabel: "Passwort",
        signInButton: "Anmelden"
    },
    ja: {
        title: "ようこそ！",
        description: "ダッシュボードに進むにはサインインしてください。",
        emailLabel: "メールアドレス",
        passwordLabel: "パスワード",
        signInButton: "サインイン"
    },
    ko: {
        title: "환영합니다!",
        description: "대시보드로 계속하려면 로그인하십시오.",
        emailLabel: "이메일",
        passwordLabel: "비밀번호",
        signInButton: "로그인"
    },
    'zh-CN': {
        title: "欢迎！",
        description: "请登录以继续访问您的仪表板。",
        emailLabel: "电子邮件",
        passwordLabel: "密码",
        signInButton: "登录"
    }
};

export function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { language } = useTheme();
  const t = translations[language] || translations.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      // Error is handled by toast in useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <Card className="relative z-10 w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Image src="/favicon.ico?v=8" alt="Logo" width={48} height={48} className="mb-4" />
          <CardTitle className="text-2xl">{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.emailLabel}</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.passwordLabel}</Label>
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              style={{ backgroundColor: '#17b878' }}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.signInButton}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
