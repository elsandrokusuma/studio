
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Upload, Palette, ChevronRight, User, Trash2 } from 'lucide-react';
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


const colors: { name: Color, bgColor: string }[] = [
    { name: 'green', bgColor: 'bg-green-500' },
    { name: 'blue', bgColor: 'bg-blue-500' },
    { name: 'orange', bgColor: 'bg-orange-500' },
    { name: 'rose', bgColor: 'bg-rose-500' },
    { name: 'violet', bgColor: 'bg-violet-500' },
];

const wallpaperCategories = {
    Nature: Array.from({ length: 10 }, (_, i) => ({
        name: `Nature ${i + 1}`,
        value: `https://picsum.photos/seed/nature_${i + 1}/1920/1080`,
        hint: 'nature',
    })),
    City: Array.from({ length: 10 }, (_, i) => ({
        name: `City ${i + 1}`,
        value: `https://picsum.photos/seed/cityscape_${i + 1}/1920/1080`,
        hint: 'city architecture',
    })),
    Tech: Array.from({ length: 10 }, (_, i) => {
        const seeds = ['circuit', 'code', 'server', 'abstract', 'network', 'futuristic', 'data', 'processor', 'digital', 'developer'];
        const hints = ['circuit board', 'code', 'server room', 'abstract tech', 'network', 'futuristic city', 'data stream', 'microchip', 'digital art', 'developer setup'];
        return {
            name: `Tech ${i + 1}`,
            value: `https://picsum.photos/seed/${seeds[i]}/1920/1080`,
            hint: hints[i],
        }
    }),
};

type Category = keyof typeof wallpaperCategories;
type ActiveMenu = 'main' | 'appearance' | 'account';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48" {...props}>
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
            <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C42.099 34.551 44 29.829 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
        </svg>
    )
}

function AccountSettings({ onBack }: { onBack: () => void }) {
    const { user, loading, signIn, signOut, deleteAccount } = useAuth();
    const { toast } = useToast();

    const handleDelete = async () => {
        try {
            await deleteAccount();
            toast({
                title: "Akun Dihapus",
                description: "Akun Anda telah berhasil dihapus.",
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
                                    <AvatarImage src={user.photoURL || undefined} />
                                    <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-lg">{user.displayName}</p>
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
                                    <p className="text-sm">Connect your account to see your profile.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Login Akun Google</CardTitle>
                    <CardDescription>Kelola koneksi akun Google Anda untuk login.</CardDescription>
                </CardHeader>
                 <CardContent>
                    {loading ? (
                        <Skeleton className="h-14 w-full" />
                    ) : user ? (
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <GoogleIcon className="h-6 w-6" />
                                <div>
                                    <p className="font-medium">Terhubung dengan Google</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                            <Button variant="outline" onClick={signOut}>Putuskan</Button>
                        </div>
                    ) : (
                        <Button onClick={signIn} className="w-full">
                            <GoogleIcon className="mr-2 h-5 w-5" />
                            Hubungkan dengan Google
                        </Button>
                    )}
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
    )
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
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
    
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
            toast({
                title: 'Wallpaper Diperbarui',
                description: 'Wallpaper latar belakang Anda telah diubah.',
            });
        };
        reader.readAsDataURL(file);
    };

    const renderWallpaperSelection = () => {
        if (selectedCategory) {
            const wallpapers = wallpaperCategories[selectedCategory];
            return (
                <>
                    <div className="flex items-center justify-between">
                        <Label>Pilih Wallpaper {selectedCategory}</Label>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                        {wallpapers.map((wp) => (
                             <div
                                key={wp.name}
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
                </>
            );
        }

        return (
            <>
                <div>
                    <Label>Wallpaper Latar Belakang</Label>
                    <p className="text-sm text-muted-foreground">Pilih wallpaper default atau unggah gambar Anda sendiri.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                     <div
                        key="default"
                        className={cn(
                            "relative aspect-video rounded-md overflow-hidden cursor-pointer ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 bg-muted",
                            wallpaper === 'default' && "ring-2 ring-primary"
                        )}
                        onClick={() => setWallpaper('default')}
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setWallpaper('default')}
                    >
                        <div className="absolute inset-0 flex items-end p-2">
                            <p className="text-muted-foreground text-xs font-medium">Solid Color</p>
                        </div>
                         {wallpaper === 'default' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Check className="h-6 w-6 text-primary" />
                            </div>
                        )}
                    </div>
                    {Object.keys(wallpaperCategories).map((category) => (
                        <div
                            key={category}
                            className="relative aspect-video rounded-md overflow-hidden cursor-pointer ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                            onClick={() => setSelectedCategory(category as Category)}
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory(category as Category)}
                        >
                            <Image
                                src={wallpaperCategories[category as Category][0].value}
                                alt={category}
                                fill
                                className="object-cover"
                                data-ai-hint={wallpaperCategories[category as Category][0].hint}
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-end p-2">
                                <p className="text-white text-xs font-medium">{category}</p>
                            </div>
                        </div>
                    ))}
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
            </>
        );
    }
    
    return (
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
                <CardContent className="p-6 space-y-8">
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

                    <div className="space-y-4">
                        {renderWallpaperSelection()}
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
                            disabled={wallpaper === 'default'}
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
    const [activeMenu, setActiveMenu] = React.useState<ActiveMenu>('main');

    return (
        <div className="max-w-2xl mx-auto relative overflow-x-hidden no-scrollbar" style={{ minHeight: 'calc(100vh - 120px)' }}>
            <div className={cn(
                "w-full transition-transform duration-300 ease-in-out",
                activeMenu !== 'main' && "-translate-x-full opacity-0 absolute"
            )}>
                <MainSettings onMenuClick={setActiveMenu} />
            </div>
             <div className={cn(
                "w-full transition-transform duration-300 ease-in-out",
                activeMenu !== 'account' && "translate-x-full opacity-0 absolute"
            )}>
                <AccountSettings onBack={() => setActiveMenu('main')} />
            </div>
            <div className={cn(
                "w-full transition-transform duration-300 ease-in-out",
                activeMenu !== 'appearance' && "translate-x-full opacity-0 absolute"
            )}>
                <AppearanceSettings onBack={() => setActiveMenu('main')} />
            </div>
        </div>
    );
}
