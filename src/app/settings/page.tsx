
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Upload, Palette, ChevronRight, User, Trash2, Image as ImageIcon, Droplets, Contrast, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme, type Color } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications } from '@/hooks/use-notifications';


const colors: { name: Color, bgColor: string }[] = [
    { name: 'green', bgColor: 'bg-green-500' },
    { name: 'blue', bgColor: 'bg-blue-500' },
    { name: 'orange', bgColor: 'bg-orange-500' },
    { name: 'rose', bgColor: 'bg-rose-500' },
    { name: 'violet', bgColor: 'bg-violet-500' },
];

const galleryWallpapers = [
    // Abstract
    { name: 'Abstract 1', value: 'https://picsum.photos/seed/101/600/400', hint: 'abstract art' },
    { name: 'Abstract 2', value: 'https://picsum.photos/seed/102/600/400', hint: 'abstract colorful' },
    { name: 'Abstract 3', value: 'https://picsum.photos/seed/103/600/400', hint: 'abstract geometric' },
    { name: 'Abstract 4', value: 'https://picsum.photos/seed/104/600/400', hint: 'abstract light' },
    // Nature
    { name: 'Nature 1', value: 'https://picsum.photos/seed/201/600/400', hint: 'nature forest' },
    { name: 'Nature 2', value: 'https://picsum.photos/seed/202/600/400', hint: 'nature leaves' },
    { name: 'Nature 3', value: 'https://picsum.photos/seed/203/600/400', hint: 'nature flower' },
    { name: 'Nature 4', value: 'https://picsum.photos/seed/204/600/400', hint: 'nature tree' },
    // Beach & Ocean
    { name: 'Beach 1', value: 'https://picsum.photos/seed/301/600/400', hint: 'beach sand' },
    { name: 'Beach 2', value: 'https://picsum.photos/seed/302/600/400', hint: 'beach sunset' },
    { name: 'Ocean 1', value: 'https://picsum.photos/seed/303/600/400', hint: 'ocean waves' },
    { name: 'Ocean 2', value: 'https://picsum.photos/seed/304/600/400', hint: 'ocean underwater' },
    // Mountains
    { name: 'Mountain 1', value: 'https://picsum.photos/seed/401/600/400', hint: 'mountains snow' },
    { name: 'Mountain 2', value: 'https://picsum.photos/seed/402/600/400', hint: 'mountains valley' },
    { name: 'Mountain 3', value: 'https://picsum.photos/seed/403/600/400', hint: 'mountains sunrise' },
    { name: 'Mountain 4', value: 'https://picsum.photos/seed/404/600/400', hint: 'mountains lake' },
    // City Light Night
    { name: 'City 1', value: 'https://picsum.photos/seed/501/600/400', hint: 'city night' },
    { name: 'City 2', value: 'https://picsum.photos/seed/502/600/400', hint: 'city lights' },
    { name: 'City 3', value: 'https://picsum.photos/seed/503/600/400', hint: 'city skyline' },
    { name: 'City 4', value: 'https://picsum.photos/seed/504/600/400', hint: 'city street' },
    // Technology
    { name: 'Technology 1', value: 'https://picsum.photos/seed/601/600/400', hint: 'technology circuit' },
    { name: 'Technology 2', value: 'https://picsum.photos/seed/602/600/400', hint: 'technology code' },
    { name: 'Technology 3', value: 'https://picsum.photos/seed/603/600/400', hint: 'technology futuristic' },
    { name: 'Technology 4', value: 'https://picsum.photos/seed/604/600/400', hint: 'technology server' },
    // Pattern
    { name: 'Pattern 1', value: 'https://picsum.photos/seed/701/600/400', hint: 'pattern geometric' },
    { name: 'Pattern 2', value: 'https://picsum.photos/seed/702/600/400', hint: 'pattern texture' },
    { name: 'Pattern 3', value: 'https://picsum.photos/seed/703/600/400', hint: 'pattern lines' },
    { name: 'Pattern 4', value: 'https://picsum.photos/seed/704/600/400', hint: 'pattern wood' },
];

const solidColors = [
    { name: 'Default', value: 'default', hint: 'Default theme color' },
    { name: 'Black', value: '#000000', hint: 'bg-black' },
    { name: 'White', value: '#ffffff', hint: 'bg-white' },
    { name: 'Slate', value: '#64748b', hint: 'bg-slate-500' },
    { name: 'Gray', value: '#6b7280', hint: 'bg-gray-500' },
    { name: 'Red', value: '#ef4444', hint: 'bg-red-500' },
    { name: 'Orange', value: '#f97316', hint: 'bg-orange-500' },
    { name: 'Amber', value: '#f59e0b', hint: 'bg-amber-500' },
    { name: 'Yellow', value: '#eab308', hint: 'bg-yellow-500' },
    { name: 'Lime', value: '#84cc16', hint: 'bg-lime-500' },
    { name: 'Green', value: '#22c55e', hint: 'bg-green-500' },
    { name: 'Emerald', value: '#10b981', hint: 'bg-emerald-500' },
    { name: 'Teal', value: '#14b8a6', hint: 'bg-teal-500' },
    { name: 'Cyan', value: '#06b6d4', hint: 'bg-cyan-500' },
    { name: 'Sky', value: '#0ea5e9', hint: 'bg-sky-500' },
    { name: 'Blue', value: '#3b82f6', hint: 'bg-blue-500' },
    { name: 'Indigo', value: '#6366f1', hint: 'bg-indigo-500' },
    { name: 'Violet', value: '#8b5cf6', hint: 'bg-violet-500' },
    { name: 'Purple', value: '#a855f7', hint: 'bg-purple-500' },
    { name: 'Fuchsia', value: '#d946ef', hint: 'bg-fuchsia-500' },
    { name: 'Pink', value: '#ec4899', hint: 'bg-pink-500' },
    { name: 'Rose', value: '#f43f5e', hint: 'bg-rose-500' },
];

const languages = [
    { name: 'English', code: 'en' },
    { name: 'Indonesia', code: 'id' },
    { name: 'Español', code: 'es' },
    { name: 'Français', code: 'fr' },
    { name: 'Deutsch', code: 'de' },
    { name: '日本語', code: 'ja' },
    { name: '한국어', code: 'ko' },
    { name: '简体中文', code: 'zh-CN' },
];


type ActiveMenu = 'main' | 'appearance' | 'account' | 'language';

const translations = {
    en: {
        back: 'Back',
        backToSettings: 'Back to Settings',
        account: 'Account',
        accountDesc: 'Manage your account details and preferences.',
        profile: 'Profile',
        profileDesc: 'Basic information about your account.',
        notSignedIn: 'Not signed in',
        notSignedInDesc: 'Sign in to manage your account.',
        signOut: 'Sign Out',
        deleteAccount: 'Delete Account',
        deleteAccountDesc: 'This will permanently delete your account and all your data. This action cannot be undone.',
        deleteMyAccount: 'Delete My Account',
        areYouSure: 'Are you sure?',
        deleteWarning: 'This will permanently delete your account and all related data. You cannot undo this action.',
        cancel: 'Cancel',
        confirmDelete: 'Yes, Delete My Account',
        language: 'Language',
        languageDesc: 'Choose the display language for the application.',
        backToAppearance: 'Back to Appearance',
        appearance: 'Appearance',
        appearanceDesc: 'Customize the look and feel of the application.',
        darkMode: 'Dark Mode',
        darkModeDesc: 'Enable or disable the dark theme.',
        themeColor: 'Theme Color',
        themeColorDesc: 'Select your preferred theme color.',
        backgroundWallpaper: 'Background Wallpaper',
        backgroundWallpaperDesc: 'Choose a default wallpaper or upload your own image.',
        solidColor: 'Solid Color',
        wallpaperGallery: 'Wallpaper Gallery',
        uploadImage: 'Upload Image',
        wallpaperDarkness: 'Wallpaper Darkness Level',
        wallpaperDarknessDesc: 'Adjust how dark the overlay on the wallpaper is.',
        componentTransparency: 'Component Transparency',
        componentTransparencyDesc: 'Set the transparency for cards and headers.',
        galleryDesc: 'Choose from a diverse collection of images.',
        solidColorDesc: 'Choose a solid background color.',
        settings: 'Settings',
        settingsDesc: 'Manage your application preferences.',
        manageAccount: 'Manage your account details.',
        customizeAppearance: 'Customize theme, colors, and wallpaper.',
        chooseLanguage: 'Choose your preferred language.',
        accountDeleted: 'Account Deleted',
        accountDeletedDesc: 'Your account has been successfully deleted.',
        deleteFailed: 'Failed to Delete Account',
        languageUpdated: 'Language Updated',
        languageUpdatedDesc: (lang: string) => `Language has been set to ${lang}.`,
        wallpaperUpdated: 'Wallpaper Updated',
        wallpaperUpdatedDesc: 'Your background wallpaper has been changed.',
        fileTooLarge: 'File Too Large',
        fileTooLargeDesc: 'Image size cannot exceed 5MB.',
        languages: { 'English': 'English', 'Indonesia': 'Indonesian', 'Español': 'Spanish', 'Français': 'French', 'Deutsch': 'German', '日本語': 'Japanese', '한국어': 'Korean', '简体中文': 'Chinese (Simplified)' },
    },
    id: {
        back: 'Kembali',
        backToSettings: 'Kembali ke Pengaturan',
        account: 'Akun',
        accountDesc: 'Kelola detail dan preferensi akun Anda.',
        profile: 'Profil',
        profileDesc: 'Informasi dasar tentang akun Anda.',
        notSignedIn: 'Belum masuk',
        notSignedInDesc: 'Masuk untuk mengelola akun Anda.',
        signOut: 'Keluar',
        deleteAccount: 'Hapus Akun',
        deleteAccountDesc: 'Tindakan ini akan menghapus akun dan semua data Anda secara permanen. Tindakan ini tidak dapat diurungkan.',
        deleteMyAccount: 'Hapus Akun Saya',
        areYouSure: 'Apakah Anda yakin?',
        deleteWarning: 'Ini akan menghapus akun Anda secara permanen dan semua data terkait. Anda tidak dapat mengurungkan tindakan ini.',
        cancel: 'Batal',
        confirmDelete: 'Ya, Hapus Akun Saya',
        language: 'Bahasa',
        languageDesc: 'Pilih bahasa tampilan untuk aplikasi.',
        backToAppearance: 'Kembali ke Tampilan',
        appearance: 'Tampilan',
        appearanceDesc: 'Sesuaikan tampilan dan nuansa aplikasi.',
        darkMode: 'Mode Gelap',
        darkModeDesc: 'Aktifkan atau nonaktifkan tema gelap.',
        themeColor: 'Warna Tema',
        themeColorDesc: 'Pilih warna tema pilihan Anda.',
        backgroundWallpaper: 'Wallpaper Latar Belakang',
        backgroundWallpaperDesc: 'Pilih wallpaper default atau unggah gambar Anda sendiri.',
        solidColor: 'Warna Solid',
        wallpaperGallery: 'Galeri Wallpaper',
        uploadImage: 'Unggah Gambar',
        wallpaperDarkness: 'Tingkat Kegelapan Wallpaper',
        wallpaperDarknessDesc: 'Atur seberapa gelap overlay pada wallpaper.',
        componentTransparency: 'Transparansi Komponen',
        componentTransparencyDesc: 'Atur transparansi untuk card dan header.',
        galleryDesc: 'Pilih dari koleksi gambar yang beragam.',
        solidColorDesc: 'Pilih warna latar belakang solid.',
        settings: 'Pengaturan',
        settingsDesc: 'Kelola preferensi aplikasi Anda.',
        manageAccount: 'Kelola detail akun Anda.',
        customizeAppearance: 'Sesuaikan tema, warna, dan wallpaper.',
        chooseLanguage: 'Pilih bahasa pilihan Anda.',
        accountDeleted: 'Akun Dihapus',
        accountDeletedDesc: 'Akun Anda telah berhasil dihapus.',
        deleteFailed: 'Gagal Menghapus Akun',
        languageUpdated: 'Bahasa Diperbarui',
        languageUpdatedDesc: (lang: string) => `Bahasa telah diatur ke ${lang}.`,
        wallpaperUpdated: 'Wallpaper Diperbarui',
        wallpaperUpdatedDesc: 'Wallpaper latar belakang Anda telah diubah.',
        fileTooLarge: 'File Terlalu Besar',
        fileTooLargeDesc: 'Ukuran gambar tidak boleh melebihi 5MB.',
        languages: { 'English': 'Inggris', 'Indonesia': 'Indonesia', 'Español': 'Spanyol', 'Français': 'Prancis', 'Deutsch': 'Jerman', '日本語': 'Jepang', '한국어': 'Korea', '简体中文': 'Mandarin (Sederhana)' },
    },
    es: {
        back: 'Atrás',
        backToSettings: 'Volver a Ajustes',
        account: 'Cuenta',
        accountDesc: 'Gestiona los detalles y preferencias de tu cuenta.',
        profile: 'Perfil',
        profileDesc: 'Información básica sobre tu cuenta.',
        notSignedIn: 'No has iniciado sesión',
        notSignedInDesc: 'Inicia sesión para gestionar tu cuenta.',
        signOut: 'Cerrar sesión',
        deleteAccount: 'Eliminar Cuenta',
        deleteAccountDesc: 'Esto eliminará permanentemente tu cuenta y todos tus datos. Esta acción no se puede deshacer.',
        deleteMyAccount: 'Eliminar Mi Cuenta',
        areYouSure: '¿Estás seguro?',
        deleteWarning: 'Esto eliminará permanentemente tu cuenta y todos los datos relacionados. No puedes deshacer esta acción.',
        cancel: 'Cancelar',
        confirmDelete: 'Sí, Eliminar Mi Cuenta',
        language: 'Idioma',
        languageDesc: 'Elige el idioma de visualización de la aplicación.',
        backToAppearance: 'Volver a Apariencia',
        appearance: 'Apariencia',
        appearanceDesc: 'Personaliza el aspecto y la sensación de la aplicación.',
        darkMode: 'Modo Oscuro',
        darkModeDesc: 'Activa o desactiva el tema oscuro.',
        themeColor: 'Color del Tema',
        themeColorDesc: 'Selecciona tu color de tema preferido.',
        backgroundWallpaper: 'Fondo de Pantalla',
        backgroundWallpaperDesc: 'Elige un fondo de pantalla predeterminado o sube tu propia imagen.',
        solidColor: 'Color Sólido',
        wallpaperGallery: 'Galería de Fondos',
        uploadImage: 'Subir Imagen',
        wallpaperDarkness: 'Nivel de Oscuridad del Fondo',
        wallpaperDarknessDesc: 'Ajusta qué tan oscura es la superposición en el fondo de pantalla.',
        componentTransparency: 'Transparencia de Componentes',
        componentTransparencyDesc: 'Establece la transparencia para las tarjetas y encabezados.',
        galleryDesc: 'Elige de una diversa colección de imágenes.',
        solidColorDesc: 'Elige un color de fondo sólido.',
        settings: 'Ajustes',
        settingsDesc: 'Gestiona las preferencias de tu aplicación.',
        manageAccount: 'Gestiona los detalles de tu cuenta.',
        customizeAppearance: 'Personaliza tema, colores y fondo de pantalla.',
        chooseLanguage: 'Elige tu idioma preferido.',
        accountDeleted: 'Cuenta Eliminada',
        accountDeletedDesc: 'Tu cuenta ha sido eliminada con éxito.',
        deleteFailed: 'Error al Eliminar la Cuenta',
        languageUpdated: 'Idioma Actualizado',
        languageUpdatedDesc: (lang: string) => `El idioma se ha establecido en ${lang}.`,
        wallpaperUpdated: 'Fondo de Pantalla Actualizado',
        wallpaperUpdatedDesc: 'Tu fondo de pantalla ha sido cambiado.',
        fileTooLarge: 'Archivo Demasiado Grande',
        fileTooLargeDesc: 'El tamaño de la imagen no puede exceder los 5MB.',
        languages: { 'English': 'Inglés', 'Indonesia': 'Indonesio', 'Español': 'Español', 'Français': 'Francés', 'Deutsch': 'Alemán', '日本語': 'Japonés', '한국어': 'Coreano', '简体中文': 'Chino (Simplificado)' },
    },
    fr: {
        back: 'Retour',
        backToSettings: 'Retour aux Paramètres',
        account: 'Compte',
        accountDesc: 'Gérez les détails et les préférences de votre compte.',
        profile: 'Profil',
        profileDesc: 'Informations de base sur votre compte.',
        notSignedIn: 'Non connecté',
        notSignedInDesc: 'Connectez-vous pour gérer votre compte.',
        signOut: 'Se déconnecter',
        deleteAccount: 'Supprimer le Compte',
        deleteAccountDesc: 'Cela supprimera définitivement votre compte et toutes vos données. Cette action est irréversible.',
        deleteMyAccount: 'Supprimer Mon Compte',
        areYouSure: 'Êtes-vous sûr ?',
        deleteWarning: 'Cela supprimera définitivement votre compte et toutes les données associées. Vous ne pouvez pas annuler cette action.',
        cancel: 'Annuler',
        confirmDelete: 'Oui, Supprimer Mon Compte',
        language: 'Langue',
        languageDesc: 'Choisissez la langue d\'affichage de l\'application.',
        backToAppearance: 'Retour à l\'Apparence',
        appearance: 'Apparence',
        appearanceDesc: 'Personnalisez l\'apparence et l\'ergonomie de l\'application.',
        darkMode: 'Mode Sombre',
        darkModeDesc: 'Activez ou désactivez le thème sombre.',
        themeColor: 'Couleur du Thème',
        themeColorDesc: 'Sélectionnez votre couleur de thème préférée.',
        backgroundWallpaper: 'Fond d\'Écran',
        backgroundWallpaperDesc: 'Choisissez un fond d\'écran par défaut ou téléchargez votre propre image.',
        solidColor: 'Couleur Unie',
        wallpaperGallery: 'Galerie de Fonds d\'Écran',
        uploadImage: 'Télécharger une Image',
        wallpaperDarkness: 'Niveau d\'Obscurité du Fond d\'Écran',
        wallpaperDarknessDesc: 'Ajustez l\'opacité de la superposition sur le fond d\'écran.',
        componentTransparency: 'Transparence des Composants',
        componentTransparencyDesc: 'Définissez la transparence des cartes et des en-têtes.',
        galleryDesc: 'Choisissez parmi une collection variée d\'images.',
        solidColorDesc: 'Choisissez une couleur de fond unie.',
        settings: 'Paramètres',
        settingsDesc: 'Gérez les préférences de votre application.',
        manageAccount: 'Gérez les détails de votre compte.',
        customizeAppearance: 'Personnalisez le thème, les couleurs et le fond d\'écran.',
        chooseLanguage: 'Choisissez votre langue préférée.',
        accountDeleted: 'Compte Supprimé',
        accountDeletedDesc: 'Votre compte a été supprimé avec succès.',
        deleteFailed: 'Échec de la Suppression du Compte',
        languageUpdated: 'Langue Mise à Jour',
        languageUpdatedDesc: (lang: string) => `La langue a été définie sur ${lang}.`,
        wallpaperUpdated: 'Fond d\'Écran Mis à Jour',
        wallpaperUpdatedDesc: 'Votre fond d\'écran a été modifié.',
        fileTooLarge: 'Fichier Trop Volumineux',
        fileTooLargeDesc: 'La taille de l\'image ne peut pas dépasser 5 Mo.',
        languages: { 'English': 'Anglais', 'Indonesia': 'Indonésien', 'Español': 'Espagnol', 'Français': 'Français', 'Deutsch': 'Allemand', '日本語': 'Japonais', '한국어': 'Coréen', '简体中文': 'Chinois (Simplifié)' },
    },
    de: {
        back: 'Zurück',
        backToSettings: 'Zurück zu den Einstellungen',
        account: 'Konto',
        accountDesc: 'Verwalten Sie Ihre Kontodetails und -einstellungen.',
        profile: 'Profil',
        profileDesc: 'Grundlegende Informationen zu Ihrem Konto.',
        notSignedIn: 'Nicht angemeldet',
        notSignedInDesc: 'Melden Sie sich an, um Ihr Konto zu verwalten.',
        signOut: 'Abmelden',
        deleteAccount: 'Konto Löschen',
        deleteAccountDesc: 'Dadurch werden Ihr Konto und alle Ihre Daten dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.',
        deleteMyAccount: 'Mein Konto Löschen',
        areYouSure: 'Sind Sie sicher?',
        deleteWarning: 'Dadurch werden Ihr Konto und alle zugehörigen Daten dauerhaft gelöscht. Sie können diese Aktion nicht rückgängig machen.',
        cancel: 'Abbrechen',
        confirmDelete: 'Ja, Mein Konto Löschen',
        language: 'Sprache',
        languageDesc: 'Wählen Sie die Anzeigesprache für die Anwendung.',
        backToAppearance: 'Zurück zum Erscheinungsbild',
        appearance: 'Erscheinungsbild',
        appearanceDesc: 'Passen Sie das Aussehen und die Bedienung der Anwendung an.',
        darkMode: 'Dunkelmodus',
        darkModeDesc: 'Aktivieren oder deaktivieren Sie das dunkle Thema.',
        themeColor: 'Themenfarbe',
        themeColorDesc: 'Wählen Sie Ihre bevorzugte Themenfarbe.',
        backgroundWallpaper: 'Hintergrundbild',
        backgroundWallpaperDesc: 'Wählen Sie ein Standard-Hintergrundbild oder laden Sie Ihr eigenes Bild hoch.',
        solidColor: 'Einfarbig',
        wallpaperGallery: 'Bildergalerie',
        uploadImage: 'Bild Hochladen',
        wallpaperDarkness: 'Dunkelheitsgrad des Hintergrundbilds',
        wallpaperDarknessDesc: 'Passen Sie an, wie dunkel die Überlagerung auf dem Hintergrundbild ist.',
        componentTransparency: 'Komponententransparenz',
        componentTransparencyDesc: 'Stellen Sie die Transparenz für Karten und Kopfzeilen ein.',
        galleryDesc: 'Wählen Sie aus einer vielfältigen Sammlung von Bildern.',
        solidColorDesc: 'Wählen Sie eine einfarbige Hintergrundfarbe.',
        settings: 'Einstellungen',
        settingsDesc: 'Verwalten Sie Ihre Anwendungseinstellungen.',
        manageAccount: 'Verwalten Sie Ihre Kontodetails.',
        customizeAppearance: 'Passen Sie Thema, Farben und Hintergrundbild an.',
        chooseLanguage: 'Wählen Sie Ihre bevorzugte Sprache.',
        accountDeleted: 'Konto Gelöscht',
        accountDeletedDesc: 'Ihr Konto wurde erfolgreich gelöscht.',
        deleteFailed: 'Fehler beim Löschen des Kontos',
        languageUpdated: 'Sprache Aktualisiert',
        languageUpdatedDesc: (lang: string) => `Die Sprache wurde auf ${lang} eingestellt.`,
        wallpaperUpdated: 'Hintergrundbild Aktualisiert',
        wallpaperUpdatedDesc: 'Ihr Hintergrundbild wurde geändert.',
        fileTooLarge: 'Datei Zu Groß',
        fileTooLargeDesc: 'Die Bildgröße darf 5 MB nicht überschreiten.',
        languages: { 'English': 'Englisch', 'Indonesia': 'Indonesisch', 'Español': 'Spanisch', 'Français': 'Französisch', 'Deutsch': 'Deutsch', '日本語': 'Japanisch', '한국어': 'Koreanisch', '简体中文': 'Chinesisch (Vereinfacht)' },
    },
    ja: {
        back: '戻る',
        backToSettings: '設定に戻る',
        account: 'アカウント',
        accountDesc: 'アカウントの詳細と設定を管理します。',
        profile: 'プロフィール',
        profileDesc: 'アカウントに関する基本情報。',
        notSignedIn: 'サインインしていません',
        notSignedInDesc: 'アカウントを管理するにはサインインしてください。',
        signOut: 'サインアウト',
        deleteAccount: 'アカウントを削除',
        deleteAccountDesc: 'これにより、アカウントとすべてのデータが完全に削除されます。この操作は元に戻せません。',
        deleteMyAccount: 'マイアカウントを削除',
        areYouSure: 'よろしいですか？',
        deleteWarning: 'これにより、アカウントと関連するすべてのデータが完全に削除されます。この操作を元に戻すことはできません。',
        cancel: 'キャンセル',
        confirmDelete: 'はい、マイアカウントを削除します',
        language: '言語',
        languageDesc: 'アプリケーションの表示言語を選択します。',
        backToAppearance: '外観に戻る',
        appearance: '外観',
        appearanceDesc: 'アプリケーションのルックアンドフィールをカスタマイズします。',
        darkMode: 'ダークモード',
        darkModeDesc: 'ダークテーマを有効または無効にします。',
        themeColor: 'テーマカラー',
        themeColorDesc: 'お好みのテーマカラーを選択してください。',
        backgroundWallpaper: '背景の壁紙',
        backgroundWallpaperDesc: 'デフォルトの壁紙を選択するか、独自の画像をアップロードします。',
        solidColor: '単色',
        wallpaperGallery: '壁紙ギャラリー',
        uploadImage: '画像をアップロード',
        wallpaperDarkness: '壁紙の暗さのレベル',
        wallpaperDarknessDesc: '壁紙のオーバーレイの暗さを調整します。',
        componentTransparency: 'コンポーネントの透明度',
        componentTransparencyDesc: 'カードとヘッダーの透明度を設定します。',
        galleryDesc: '多様な画像のコレクションから選択します。',
        solidColorDesc: '単色の背景色を選択します。',
        settings: '設定',
        settingsDesc: 'アプリケーションの設定を管理します。',
        manageAccount: 'アカウントの詳細を管理します。',
        customizeAppearance: 'テーマ、色、壁紙をカスタマイズします。',
        chooseLanguage: 'お好みの言語を選択してください。',
        accountDeleted: 'アカウントが削除されました',
        accountDeletedDesc: 'アカウントは正常に削除されました。',
        deleteFailed: 'アカウントの削除に失敗しました',
        languageUpdated: '言語が更新されました',
        languageUpdatedDesc: (lang: string) => `言語が${lang}に設定されました。`,
        wallpaperUpdated: '壁紙が更新されました',
        wallpaperUpdatedDesc: '背景の壁紙が変更されました。',
        fileTooLarge: 'ファイルが大きすぎます',
        fileTooLargeDesc: '画像サイズは5MBを超えることはできません。',
        languages: { 'English': '英語', 'Indonesia': 'インドネシア語', 'Español': 'スペイン語', 'Français': 'フランス語', 'Deutsch': 'ドイツ語', '日本語': '日本語', '한국어': '韓国語', '简体中文': '中国語（簡体字）' },
    },
    ko: {
        back: '뒤로',
        backToSettings: '설정으로 돌아가기',
        account: '계정',
        accountDesc: '계정 세부 정보 및 기본 설정을 관리합니다.',
        profile: '프로필',
        profileDesc: '계정에 대한 기본 정보입니다.',
        notSignedIn: '로그인하지 않음',
        notSignedInDesc: '계정을 관리하려면 로그인하세요.',
        signOut: '로그아웃',
        deleteAccount: '계정 삭제',
        deleteAccountDesc: '계정과 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.',
        deleteMyAccount: '내 계정 삭제',
        areYouSure: '확실합니까?',
        deleteWarning: '계정과 관련된 모든 데이터가 영구적으로 삭제됩니다. 이 작업을 되돌릴 수 없습니다.',
        cancel: '취소',
        confirmDelete: '예, 내 계정을 삭제합니다',
        language: '언어',
        languageDesc: '응용 프로그램의 표시 언어를 선택하십시오.',
        backToAppearance: '모양으로 돌아가기',
        appearance: '모양',
        appearanceDesc: '응용 프로그램의 모양과 느낌을 사용자 정의하십시오.',
        darkMode: '다크 모드',
        darkModeDesc: '다크 테마를 활성화하거나 비활성화합니다.',
        themeColor: '테마 색상',
        themeColorDesc: '기본 테마 색상을 선택하십시오.',
        backgroundWallpaper: '배경 화면',
        backgroundWallpaperDesc: '기본 배경 화면을 선택하거나 자신의 이미지를 업로드하십시오.',
        solidColor: '단색',
        wallpaperGallery: '배경 화면 갤러리',
        uploadImage: '이미지 업로드',
        wallpaperDarkness: '배경 화면 어둡기 수준',
        wallpaperDarknessDesc: '배경 화면의 오버레이가 얼마나 어두운지 조정하십시오.',
        componentTransparency: '구성 요소 투명도',
        componentTransparencyDesc: '카드 및 헤더의 투명도를 설정하십시오.',
        galleryDesc: '다양한 이미지 컬렉션에서 선택하십시오.',
        solidColorDesc: '단색 배경색을 선택하십시오.',
        settings: '설정',
        settingsDesc: '응용 프로그램 기본 설정을 관리하십시오.',
        manageAccount: '계정 세부 정보를 관리하십시오.',
        customizeAppearance: '테마, 색상 및 배경 화면을 사용자 정의하십시오.',
        chooseLanguage: '기본 언어를 선택하십시오.',
        accountDeleted: '계정이 삭제되었습니다',
        accountDeletedDesc: '계정이 성공적으로 삭제되었습니다.',
        deleteFailed: '계정 삭제 실패',
        languageUpdated: '언어가 업데이트되었습니다',
        languageUpdatedDesc: (lang: string) => `언어가 ${lang}(으)로 설정되었습니다.`,
        wallpaperUpdated: '배경 화면이 업데이트되었습니다',
        wallpaperUpdatedDesc: '배경 화면이 변경되었습니다.',
        fileTooLarge: '파일이 너무 큽니다',
        fileTooLargeDesc: '이미지 크기는 5MB를 초과할 수 없습니다.',
        languages: { 'English': '영어', 'Indonesia': '인도네시아어', 'Español': '스페인어', 'Français': '프랑스어', 'Deutsch': '독일어', '日本語': '일본어', '한국어': '한국어', '简体中文': '중국어(간체)' },
    },
    'zh-CN': {
        back: '返回',
        backToSettings: '返回设置',
        account: '账户',
        accountDesc: '管理您的账户详情和偏好设置。',
        profile: '个人资料',
        profileDesc: '关于您账户的基本信息。',
        notSignedIn: '未登录',
        notSignedInDesc: '登录以管理您的账户。',
        signOut: '退出登录',
        deleteAccount: '删除账户',
        deleteAccountDesc: '这将永久删除您的账户和所有数据。此操作无法撤销。',
        deleteMyAccount: '删除我的账户',
        areYouSure: '您确定吗？',
        deleteWarning: '这将永久删除您的账户及所有相关数据。您无法撤销此操作。',
        cancel: '取消',
        confirmDelete: '是的，删除我的账户',
        language: '语言',
        languageDesc: '选择应用程序的显示语言。',
        backToAppearance: '返回外观',
        appearance: '外观',
        appearanceDesc: '自定义应用程序的外观和感觉。',
        darkMode: '深色模式',
        darkModeDesc: '启用或禁用深色主题。',
        themeColor: '主题颜色',
        themeColorDesc: '选择您喜欢的主题颜色。',
        backgroundWallpaper: '背景墙纸',
        backgroundWallpaperDesc: '选择默认墙纸或上传您自己的图片。',
        solidColor: '纯色',
        wallpaperGallery: '墙纸库',
        uploadImage: '上传图片',
        wallpaperDarkness: '墙纸暗度级别',
        wallpaperDarknessDesc: '调整墙纸上覆盖层的暗度。',
        componentTransparency: '组件透明度',
        componentTransparencyDesc: '设置卡片和标题的透明度。',
        galleryDesc: '从多样化的图片集中选择。',
        solidColorDesc: '选择纯色背景。',
        settings: '设置',
        settingsDesc: '管理您的应用程序偏好设置。',
        manageAccount: '管理您的账户详情。',
        customizeAppearance: '自定义主题、颜色和墙纸。',
        chooseLanguage: '选择您喜欢的语言。',
        accountDeleted: '账户已删除',
        accountDeletedDesc: '您的账户已成功删除。',
        deleteFailed: '删除账户失败',
        languageUpdated: '语言已更新',
        languageUpdatedDesc: (lang: string) => `语言已设置为${lang}。`,
        wallpaperUpdated: '墙纸已更新',
        wallpaperUpdatedDesc: '您的背景墙纸已更改。',
        fileTooLarge: '文件太大',
        fileTooLargeDesc: '图片大小不能超过5MB。',
        languages: { 'English': '英语', 'Indonesia': '印尼语', 'Español': '西班牙语', 'Français': '法语', 'Deutsch': '德语', '日本語': '日语', '한국어': '韩语', '简体中文': '简体中文' },
    }
};

function AccountSettings({ onBack }: { onBack: () => void }) {
    const { user, loading, signOut, deleteAccount } = useAuth();
    const { toast } = useToast();
    const { addNotification } = useNotifications();
    const { language } = useTheme();
    const t = translations[language] || translations.en;

    const handleDelete = async () => {
        try {
            await deleteAccount();
            addNotification({
                title: t.accountDeleted,
                description: t.accountDeletedDesc,
                icon: Trash2,
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: t.deleteFailed,
                description: error.message,
            });
        }
    };

    return (
        <div className="flex flex-col gap-8">
             <Button variant="ghost" onClick={onBack} className="self-start text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.backToSettings}
            </Button>
            <header>
                <h1 className="text-3xl font-bold tracking-tight">{t.account}</h1>
                <p className="text-muted-foreground">{t.accountDesc}</p>
            </header>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t.profile}</CardTitle>
                    <CardDescription>{t.profileDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {loading ? (
                                <>
                                    <Skeleton className="h-16 w-16 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-4 w-48" />
                                    </div>
                                </>
                            ) : user ? (
                                <>
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={user.photoURL || `https://robohash.org/${user.email}.png`} />
                                        <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-lg">{user.displayName || user.email}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-4 text-muted-foreground">
                                    <Avatar className="h-16 w-16 bg-muted">
                                        <AvatarFallback>
                                            <User className="h-8 w-8 text-muted-foreground" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-lg">{t.notSignedIn}</p>
                                        <p className="text-sm">{t.notSignedInDesc}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {user && <Button variant="outline" onClick={signOut}>{t.signOut}</Button>}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t.deleteAccount}</CardTitle>
                    <CardDescription>{t.deleteAccountDesc}</CardDescription>
                </CardHeader>
                <CardContent>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" disabled={!user}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t.deleteMyAccount}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>{t.areYouSure}</AlertDialogTitle>
                            <AlertDialogDescription>{t.deleteWarning}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>{t.confirmDelete}</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
    );
}

function LanguageSettings({ onBack }: { onBack: () => void }) {
    const { language, setLanguage } = useTheme();
    const { addNotification } = useNotifications();
    const t = translations[language] || translations.en;

    const handleLanguageSelect = (code: string) => {
        setLanguage(code as 'id' | 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'zh-CN');
        const selectedLang = languages.find(l => l.code === code);
        const translatedLangName = t.languages[selectedLang?.name as keyof typeof t.languages] || selectedLang?.name;
        addNotification({
            title: t.languageUpdated,
            description: t.languageUpdatedDesc(translatedLangName || ''),
            icon: Languages,
        });
    };

    return (
        <div className="flex flex-col gap-8">
            <Button variant="ghost" onClick={onBack} className="self-start text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.backToSettings}
            </Button>
            <header>
                <h1 className="text-3xl font-bold tracking-tight">{t.language}</h1>
                <p className="text-muted-foreground">{t.languageDesc}</p>
            </header>
            
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-1">
                        {languages.map(lang => (
                            <button 
                                key={lang.code}
                                onClick={() => handleLanguageSelect(lang.code)}
                                className={cn(
                                    "flex items-center justify-between w-full p-3 rounded-lg text-left transition-colors",
                                    language === lang.code ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                                )}
                            >
                                <span>{t.languages[lang.name as keyof typeof t.languages]}</span>
                                {language === lang.code && <Check className="h-5 w-5 text-primary" />}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


function AppearanceSettings({ onBack }: { onBack: () => void }) {
    const { 
        theme, setTheme, 
        color, setColor, 
        wallpaper, setWallpaper,
        wallpaperOpacity, setWallpaperOpacity,
        componentOpacity, setComponentOpacity,
        language
    } = useTheme();
    const t = translations[language] || translations.en;
    const { toast } = useToast();
    const { addNotification } = useNotifications();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [activeSubMenu, setActiveSubMenu] = React.useState<'main' | 'gallery' | 'solidColor'>('main');
    
    const isDarkMode = theme === 'dark';

    const handleThemeChange = (checked: boolean) => {
        setTheme(checked ? 'dark' : 'light');
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast({
                variant: 'destructive',
                title: t.fileTooLarge,
                description: t.fileTooLargeDesc,
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setWallpaper(result);
            addNotification({
                title: t.wallpaperUpdated,
                description: t.wallpaperUpdatedDesc,
                icon: ImageIcon,
            });
        };
        reader.readAsDataURL(file);
    };

    const getLuminance = (hex: string) => {
      let r = 0, g = 0, b = 0;
      if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
      } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
      }
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    };

    React.useEffect(() => {
        if (wallpaper.startsWith('#')) {
            const luminance = getLuminance(wallpaper);
            if (luminance > 0.5) {
                document.body.classList.add('force-dark-text');
            } else {
                document.body.classList.remove('force-dark-text');
            }
        } else {
            document.body.classList.remove('force-dark-text');
        }
        return () => {
            document.body.classList.remove('force-dark-text');
        };
    }, [wallpaper]);

    const renderWallpaperSelection = () => (
        <div className="flex flex-col gap-8 no-scrollbar">
            <Button variant="ghost" onClick={() => setActiveSubMenu('main')} className="self-start text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.backToAppearance}
            </Button>
            <header>
                <h1 className="text-3xl font-bold tracking-tight">{t.wallpaperGallery}</h1>
                <p className="text-muted-foreground">{t.galleryDesc}</p>
            </header>
            <div className="no-scrollbar">
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {galleryWallpapers.map((wp) => (
                                <div
                                    key={wp.value}
                                    className={cn(
                                        "relative aspect-video rounded-md overflow-hidden cursor-pointer ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                                        wallpaper === wp.value && "ring-2 ring-primary"
                                    )}
                                    onClick={() => setWallpaper(wp.value)}
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && setWallpaper(wp.value)}
                                >
                                    <Image
                                        src={wp.value}
                                        alt={wp.name}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                        data-ai-hint={wp.hint}
                                    />
                                    <div className="absolute inset-0 bg-black/30" />
                                    {wallpaper === wp.value && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Check className="h-6 w-6 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
             </div>
        </div>
    );
    
    const renderSolidColorSelection = () => (
        <div className="flex flex-col gap-8 no-scrollbar">
            <Button variant="ghost" onClick={() => setActiveSubMenu('main')} className="self-start text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.backToAppearance}
            </Button>
            <header>
                <h1 className="text-3xl font-bold tracking-tight">{t.solidColor}</h1>
                <p className="text-muted-foreground">{t.solidColorDesc}</p>
            </header>
            <div className="no-scrollbar">
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                            {solidColors.map((c) => (
                                <div
                                    key={c.name}
                                    className="flex flex-col items-center gap-2 cursor-pointer"
                                    onClick={() => setWallpaper(c.value)}
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && setWallpaper(c.value)}
                                >
                                    <div className={cn(
                                        "relative aspect-square w-full rounded-md ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                                        wallpaper === c.value && "ring-2 ring-primary"
                                    )}>
                                        {c.value === 'default' ? (
                                            <div className="w-full h-full rounded-md bg-muted flex items-center justify-center">
                                                 <Contrast className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                        ) : (
                                            <div className={cn("w-full h-full rounded-md", c.hint)} style={{ backgroundColor: c.value.startsWith('#') ? c.value : undefined }} />
                                        )}
                                        
                                        {wallpaper === c.value && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                                                <Check className="h-6 w-6 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-center text-muted-foreground">{c.name}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
    
    return (
        <div className="relative overflow-x-hidden no-scrollbar" style={{ minHeight: 'calc(100vh - 200px)' }}>
            <div className={cn(
                "w-full transition-transform duration-300 ease-in-out no-scrollbar",
                activeSubMenu !== 'main' && "-translate-x-full opacity-0 absolute"
            )}>
                 <div className="flex flex-col gap-8">
                    <Button variant="ghost" onClick={onBack} className="self-start text-muted-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t.backToSettings}
                    </Button>
                    <header>
                        <h1 className="text-3xl font-bold tracking-tight">{t.appearance}</h1>
                        <p className="text-muted-foreground">{t.appearanceDesc}</p>
                    </header>
                    <Card>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="dark-mode">{t.darkMode}</Label>
                                    <p className="text-sm text-muted-foreground">{t.darkModeDesc}</p>
                                </div>
                                <Switch
                                    id="dark-mode"
                                    checked={isDarkMode}
                                    onCheckedChange={handleThemeChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <div>
                                    <Label>{t.themeColor}</Label>
                                    <p className="text-sm text-muted-foreground">{t.themeColorDesc}</p>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    {colors.map((c) => (
                                        <Button
                                            key={c.name}
                                            variant="outline"
                                            size="icon"
                                            className={cn('h-8 w-8 rounded-full', c.bgColor, color === c.name && 'ring-2 ring-offset-2 ring-primary')}
                                            onClick={() => setColor(c.name)}
                                        >
                                            {color === c.name && <Check className="h-4 w-4 text-white" />}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                             <div className="space-y-2">
                                <div>
                                    <Label>{t.backgroundWallpaper}</Label>
                                    <p className="text-sm text-muted-foreground">{t.backgroundWallpaperDesc}</p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                                    <div
                                        className="relative aspect-video rounded-md overflow-hidden cursor-pointer ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                                        onClick={() => setActiveSubMenu('solidColor')}
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && setActiveSubMenu('solidColor')}
                                    >
                                        <div className="absolute inset-0 bg-muted flex items-center justify-center p-2 text-center font-medium">
                                            <Droplets className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                                            <p className="text-white font-semibold">{t.solidColor}</p>
                                        </div>
                                    </div>
                                    <div
                                        className="relative aspect-video rounded-md overflow-hidden cursor-pointer ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                                        onClick={() => setActiveSubMenu('gallery')}
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && setActiveSubMenu('gallery')}
                                    >
                                        <Image src="https://picsum.photos/seed/gallery/600/400" alt="Wallpaper Gallery" fill unoptimized className="object-cover" data-ai-hint="abstract texture" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                            <p className="text-white font-semibold">{t.wallpaperGallery}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative aspect-video rounded-md border-2 border-dashed border-muted bg-popover flex flex-col items-center justify-center text-center p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <Upload className="h-6 w-6 mb-1" />
                                        <span className="text-xs font-medium">{t.uploadImage}</span>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/png, image/jpeg, image/webp"
                                            onChange={handleFileUpload}
                                        />
                                    </button>
                                </div>
                            </div>


                            <div className="space-y-4">
                                <div>
                                    <Label>{t.wallpaperDarkness}</Label>
                                    <p className="text-sm text-muted-foreground">{t.wallpaperDarknessDesc}</p>
                                </div>
                                <Slider
                                    value={[wallpaperOpacity]}
                                    onValueChange={(value) => setWallpaperOpacity(value[0])}
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    disabled={wallpaper === 'default' || wallpaper.startsWith('#')}
                                />
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <Label>{t.componentTransparency}</Label>
                                    <p className="text-sm text-muted-foreground">{t.componentTransparencyDesc}</p>
                                </div>
                                <Slider
                                    value={[componentOpacity]}
                                    onValueChange={(value) => setComponentOpacity(value[0])}
                                    min={0.5}
                                    max={1}
                                    step={0.05}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
             <div className={cn(
                "w-full transition-transform duration-300 ease-in-out absolute top-0",
                activeSubMenu !== 'gallery' && "translate-x-full opacity-0"
            )}>
                {renderWallpaperSelection()}
            </div>
             <div className={cn(
                "w-full transition-transform duration-300 ease-in-out absolute top-0",
                activeSubMenu !== 'solidColor' && "translate-x-full opacity-0"
            )}>
                {renderSolidColorSelection()}
            </div>
        </div>
    )
}

function MainSettings({ onMenuClick }: { onMenuClick: (menu: ActiveMenu) => void }) {
    const router = useRouter();
    const { language } = useTheme();
    const t = translations[language] || translations.en;
    
    return (
        <div className="flex flex-col gap-8">
             <Button variant="ghost" onClick={() => router.back()} className="self-start text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.back}
            </Button>
            <header>
                <h1 className="text-3xl font-bold tracking-tight">{t.settings}</h1>
                <p className="text-muted-foreground">{t.settingsDesc}</p>
            </header>
            <Card>
                <CardContent className="p-4 space-y-2">
                     <button 
                        onClick={() => onMenuClick('account')}
                        className="flex items-center justify-between w-full p-4 rounded-lg hover:bg-accent transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-md">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold">{t.account}</p>
                                <p className="text-sm text-muted-foreground">{t.manageAccount}</p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <button 
                        onClick={() => onMenuClick('appearance')}
                        className="flex items-center justify-between w-full p-4 rounded-lg hover:bg-accent transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-md">
                                <Palette className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold">{t.appearance}</p>
                                <p className="text-sm text-muted-foreground">{t.customizeAppearance}</p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                     <button 
                        onClick={() => onMenuClick('language')}
                        className="flex items-center justify-between w-full p-4 rounded-lg hover:bg-accent transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-md">
                                <Languages className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold">{t.language}</p>
                                <p className="text-sm text-muted-foreground">{t.chooseLanguage}</p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                </CardContent>
            </Card>
        </div>
    )
}

export default function SettingsPage() {
    const { user } = useAuth();
    const [activeMenu, setActiveMenu] = React.useState<ActiveMenu>('main');

    // If there is no user, don't render the settings page content.
    // The main layout or a higher-order component should handle redirecting to login.
    if (!user) {
        return null;
    }

    return (
        <div className="max-w-2xl mx-auto relative overflow-x-hidden no-scrollbar" style={{ minHeight: 'calc(100vh - 120px)' }}>
            <div className={cn(
                "w-full transition-transform duration-300 ease-in-out",
                activeMenu !== 'main' && "-translate-x-full opacity-0 absolute"
            )}>
                <MainSettings onMenuClick={setActiveMenu} />
            </div>
             <div className={cn(
                "w-full transition-transform duration-300 ease-in-out absolute top-0",
                activeMenu !== 'account' && "translate-x-full opacity-0"
            )}>
                <AccountSettings onBack={() => setActiveMenu('main')} />
            </div>
            <div className={cn(
                "w-full transition-transform duration-300 ease-in-out absolute top-0",
                activeMenu !== 'appearance' && "translate-x-full opacity-0"
            )}>
                <AppearanceSettings onBack={() => setActiveMenu('main')} />
            </div>
            <div className={cn(
                "w-full transition-transform duration-300 ease-in-out absolute top-0",
                activeMenu !== 'language' && "translate-x-full opacity-0"
            )}>
                <LanguageSettings onBack={() => setActiveMenu('main')} />
            </div>
        </div>
    );
}
    
    
