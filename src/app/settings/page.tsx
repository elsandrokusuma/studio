
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Upload, Palette, ChevronRight, User, Trash2, Image as ImageIcon, Droplets, Contrast } from 'lucide-react';
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


type ActiveMenu = 'main' | 'appearance' | 'account';


function AccountSettings({ onBack }: { onBack: () => void }) {
    const { user, loading, signOut, deleteAccount } = useAuth();
    const { toast } = useToast();
    const { addNotification } = useNotifications();

    const handleDelete = async () => {
        try {
            await deleteAccount();
            addNotification({
                title: "Akun Dihapus",
                description: "Akun Anda telah berhasil dihapus.",
                icon: Trash2,
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Gagal Menghapus Akun",
                description: error.message,
            });
        }
    };

    return (
        <div className="flex flex-col gap-8">
             <Button variant="ghost" onClick={onBack} className="self-start text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Pengaturan
            </Button>
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Account</h1>
                <p className="text-muted-foreground">Kelola detail dan preferensi akun Anda.</p>
            </header>
            
            <Card>
                <CardHeader>
                    <CardTitle>Profil</CardTitle>
                    <CardDescription>Informasi dasar tentang akun Anda.</CardDescription>
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
                                        <p className="font-semibold text-lg">Not signed in</p>
                                        <p className="text-sm">Sign in to manage your account.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {user && <Button variant="outline" onClick={signOut}>Sign Out</Button>}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Hapus Akun</CardTitle>
                    <CardDescription>Tindakan ini akan menghapus akun dan semua data Anda secara permanen. Tindakan ini tidak dapat diurungkan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" disabled={!user}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus Akun Saya
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Ini akan menghapus akun Anda secara permanen dan semua data terkait. Anda tidak dapat mengurungkan tindakan ini.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Ya, Hapus Akun Saya</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
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
        componentOpacity, setComponentOpacity
    } = useTheme();
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
                title: 'File Terlalu Besar',
                description: 'Ukuran gambar tidak boleh melebihi 5MB.',
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setWallpaper(result);
            addNotification({
                title: 'Wallpaper Diperbarui',
                description: 'Wallpaper latar belakang Anda telah diubah.',
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
                Kembali ke Tampilan
            </Button>
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Galeri Wallpaper</h1>
                <p className="text-muted-foreground">Pilih dari koleksi gambar yang beragam.</p>
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
                Kembali ke Tampilan
            </Button>
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Warna Solid</h1>
                <p className="text-muted-foreground">Pilih warna latar belakang solid.</p>
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
                        Kembali ke Pengaturan
                    </Button>
                    <header>
                        <h1 className="text-3xl font-bold tracking-tight">Appearance</h1>
                        <p className="text-muted-foreground">Sesuaikan tampilan dan nuansa aplikasi.</p>
                    </header>
                    <Card>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="dark-mode">Dark Mode</Label>
                                    <p className="text-sm text-muted-foreground">Aktifkan atau nonaktifkan tema gelap.</p>
                                </div>
                                <Switch
                                    id="dark-mode"
                                    checked={isDarkMode}
                                    onCheckedChange={handleThemeChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <div>
                                    <Label>Warna Tema</Label>
                                    <p className="text-sm text-muted-foreground">Pilih warna tema pilihan Anda.</p>
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
                                    <Label>Wallpaper Latar Belakang</Label>
                                    <p className="text-sm text-muted-foreground">Pilih wallpaper default atau unggah gambar Anda sendiri.</p>
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
                                            <p className="text-white font-semibold">Warna Solid</p>
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
                                            <p className="text-white font-semibold">Galeri Wallpaper</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative aspect-video rounded-md border-2 border-dashed border-muted bg-popover flex flex-col items-center justify-center text-center p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <Upload className="h-6 w-6 mb-1" />
                                        <span className="text-xs font-medium">Unggah Gambar</span>
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
                                    <Label>Tingkat Kegelapan Wallpaper</Label>
                                    <p className="text-sm text-muted-foreground">Atur seberapa gelap overlay pada wallpaper.</p>
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
                                    <Label>Transparansi Komponen</Label>
                                    <p className="text-sm text-muted-foreground">Atur transparansi untuk card dan header.</p>
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
    
    return (
        <div className="flex flex-col gap-8">
             <Button variant="ghost" onClick={() => router.back()} className="self-start text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
            </Button>
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Kelola preferensi aplikasi Anda.</p>
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
                                <p className="font-semibold">Account</p>
                                <p className="text-sm text-muted-foreground">Kelola detail akun Anda.</p>
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
                                <p className="font-semibold">Appearance</p>
                                <p className="text-sm text-muted-foreground">Sesuaikan tema, warna, dan wallpaper.</p>
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
        </div>
    );
}
