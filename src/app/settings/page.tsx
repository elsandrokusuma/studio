
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Upload, Palette, ChevronRight, User, Trash2, Image as ImageIcon, Wallpaper as WallpaperIcon } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { useNotifications } from '@/hooks/use-notifications';
import { ScrollArea } from '@/components/ui/scroll-area';


const colors: { name: Color, bgColor: string }[] = [
    { name: 'green', bgColor: 'bg-green-500' },
    { name: 'blue', bgColor: 'bg-blue-500' },
    { name: 'orange', bgColor: 'bg-orange-500' },
    { name: 'rose', bgColor: 'bg-rose-500' },
    { name: 'violet', bgColor: 'bg-violet-500' },
];

const wallpapers = [
    { name: 'Waterfall', value: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716', hint: 'nature waterfall' },
    { name: 'Mountains', value: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606', hint: 'nature mountains' },
    { name: 'Forest', value: 'https://images.unsplash.com/photo-1448375240586-882707db888b', hint: 'nature forest' },
    { name: 'Lake', value: 'https://images.unsplash.com/photo-1501854140801-50d01698950b', hint: 'nature lake' },
    { name: 'Aurora', value: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7', hint: 'nature sky' },
    { name: 'Autumn Path', value: 'https://images.unsplash.com/photo-1473117406439-369f98a6e846', hint: 'nature path' },
    { name: 'Desert', value: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0', hint: 'nature desert' },
    { name: 'Beach', value: 'https://images.unsplash.com/photo-1507525428034-b723a996f329', hint: 'nature beach' },
    { name: 'City Map', value: 'https://images.unsplash.com/photo-1599599810694-b5b37304c041', hint: 'city map' },
    { name: 'Tokyo Street', value: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989', hint: 'city night' },
    { name: 'Skyscraper', value: 'https://images.unsplash.com/photo-1523978591478-c752744f2327', hint: 'city architecture' },
    { name: 'Rooftops', value: 'https://images.unsplash.com/photo-1506752243769-53e71b12278a', hint: 'city urban' },
    { name: 'Hong Kong', value: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc', hint: 'city skyline' },
    { name: 'Neon Sign', value: 'https://images.unsplash.com/photo-1520038410233-7141be7e6f97', hint: 'city neon' },
    { name: 'Copenhagen', value: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc', hint: 'city skyline' },
    { name: 'Bridge', value: 'https://images.unsplash.com/photo-1501446529957-6226bd447c46', hint: 'city bridge' },
    { name: 'Laptop', value: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853', hint: 'technology computer' },
    { name: 'Coding', value: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c', hint: 'technology code' },
    { name: 'Circuit', value: 'https://images.unsplash.com/photo-1550751827-413370f196a1', hint: 'technology circuit' },
    { name: 'Server Room', value: 'https://images.unsplash.com/photo-1521185490212-7813a45d1f5b', hint: 'technology network' },
    { name: 'Keyboard', value: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3', hint: 'technology keyboard' },
    { name: 'Motherboard', value: 'https://images.unsplash.com/photo-1518770660439-4636190af475', hint: 'technology circuit' },
    { name: 'Wires', value: 'https://images.unsplash.com/photo-1580894732444-8ecded7948b4', hint: 'technology abstract' },
    { name: 'Desk Setup', value: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87', hint: 'technology workspace' },
    { name: 'Fox', value: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5', hint: 'animal fox' },
    { name: 'Lion', value: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d', hint: 'animal lion' },
    { name: 'Jellyfish', value: 'https://images.unsplash.com/photo-1536751033192-23fcc3a43a84', hint: 'animal jellyfish' },
    { name: 'Eagle', value: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45', hint: 'animal bird' },
    { name: 'Wolf', value: 'https://images.unsplash.com/photo-1547407139-3c921a66005c', hint: 'animal wolf' },
    { name: 'Husky', value: 'https://images.unsplash.com/photo-1590762983193-a5f2a83852cb', hint: 'animal dog' },
    { name: 'Liquid Swirl', value: 'https://images.unsplash.com/photo-1558518393-95c24a66042b', hint: 'abstract colorful' },
    { name: 'Geometric', value: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17', hint: 'abstract texture' },
    { name: 'Paint Splash', value: 'https://images.unsplash.com/photo-1483213091558-f075d351b842', hint: 'abstract paint' },
    { name: 'Cubes', value: 'https://images.unsplash.com/photo-1618214394489-13a409a808ba', hint: 'abstract 3d' },
    { name: 'Purple Waves', value: 'https://images.unsplash.com/photo-1534035431473-b39d36382162', hint: 'abstract waves' },
    { name: 'Classic Car', value: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d', hint: 'car classic' },
    { name: 'Sports Car', value: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70', hint: 'car sports' },
    { name: 'Night Drive', value: 'https://images.unsplash.com/photo-1532581140502-5353113331c1', hint: 'car night' },
    { name: 'Vintage Porsche', value: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2', hint: 'car vintage' },
    { name: 'Drifting', value: 'https://images.unsplash.com/photo-1580481222384-885994537c44', hint: 'car race' },
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
    const [showWallpaperGrid, setShowWallpaperGrid] = React.useState(false);
    
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

    const renderWallpaperSelection = () => (
        <div className="flex flex-col gap-8">
            <Button variant="ghost" onClick={() => setShowWallpaperGrid(false)} className="self-start text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Tampilan
            </Button>
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Pilih Wallpaper</h1>
                <p className="text-muted-foreground">Pilih dari koleksi kami atau unggah gambar Anda sendiri.</p>
            </header>
            <Card>
                <CardContent className="p-4 sm:p-6">
                    <ScrollArea type="never" className="h-[calc(100vh-22rem)] pr-4 -mr-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                                <div className="absolute inset-0 flex items-center justify-center p-2">
                                    <p className="text-muted-foreground text-xs text-center font-medium">Solid Color</p>
                                </div>
                                {wallpaper === 'default' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <Check className="h-6 w-6 text-white" />
                                    </div>
                                )}
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
                            {wallpapers.map((wp) => (
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
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
    
    return (
        <div className="relative overflow-x-hidden" style={{ minHeight: 'calc(100vh - 200px)' }}>
            <div className={cn(
                "w-full transition-transform duration-300 ease-in-out",
                showWallpaperGrid && "-translate-x-full opacity-0 absolute"
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
                             <button 
                                onClick={() => setShowWallpaperGrid(true)}
                                className="flex items-center justify-between w-full p-4 rounded-lg hover:bg-accent transition-colors -mx-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-primary/10 rounded-md">
                                        <WallpaperIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold">Wallpaper Latar Belakang</p>
                                        <p className="text-sm text-muted-foreground">Pilih latar belakang aplikasi.</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </button>

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
            </div>
             <div className={cn(
                "w-full transition-transform duration-300 ease-in-out absolute top-0",
                !showWallpaperGrid && "translate-x-full opacity-0"
            )}>
                {renderWallpaperSelection()}
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
