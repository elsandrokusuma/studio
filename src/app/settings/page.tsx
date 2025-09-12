
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Upload, Palette, ChevronRight, User, Trash2, Image as ImageIcon } from 'lucide-react';
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


const colors: { name: Color, bgColor: string }[] = [
    { name: 'green', bgColor: 'bg-green-500' },
    { name: 'blue', bgColor: 'bg-blue-500' },
    { name: 'orange', bgColor: 'bg-orange-500' },
    { name: 'rose', bgColor: 'bg-rose-500' },
    { name: 'violet', bgColor: 'bg-violet-500' },
];

const wallpaperCategories = {
    Nature: [
        { name: 'Forest', value: 'https://picsum.photos/seed/forest/1920/1080', hint: 'nature forest' },
        { name: 'Mountains', value: 'https://picsum.photos/seed/mountains/1920/1080', hint: 'nature mountains' },
        { name: 'Lake', value: 'https://picsum.photos/seed/lake/1920/1080', hint: 'nature lake' },
        { name: 'Aurora', value: 'https://picsum.photos/seed/aurora/1920/1080', hint: 'nature sky' },
        { name: 'Waterfall', value: 'https://picsum.photos/seed/waterfall/1920/1080', hint: 'nature waterfall' },
        { name: 'Jungle', value: 'https://picsum.photos/seed/jungle/1920/1080', hint: 'nature jungle' },
        { name: 'River', value: 'https://picsum.photos/seed/river/1920/1080', hint: 'nature river' },
        { name: 'Island', value: 'https://picsum.photos/seed/island/1920/1080', hint: 'nature island' },
        { name: 'Valley', value: 'https://picsum.photos/seed/valley/1920/1080', hint: 'nature valley' },
        { name: 'Stars', value: 'https://picsum.photos/seed/starrynight/1920/1080', hint: 'nature galaxy' },
    ],
    City: [
        { name: 'Cityscape', value: 'https://picsum.photos/seed/cityscape/1920/1080', hint: 'city architecture' },
        { name: 'Downtown', value: 'https://picsum.photos/seed/downtown/1920/1080', hint: 'city night' },
        { name: 'Metropolis', value: 'https://picsum.photos/seed/metropolis/1920/1080', hint: 'city skyline' },
        { name: 'Urban', value: 'https://picsum.photos/seed/urban/1920/1080', hint: 'city street' },
        { name: 'Architecture', value: 'https://picsum.photos/seed/architecture/1920/1080', hint: 'building urban' },
        { name: 'Skyscraper', value: 'https://picsum.photos/seed/skyscraper/1920/1080', hint: 'city skyscraper' },
        { name: 'Town', value: 'https://picsum.photos/seed/town/1920/1080', hint: 'city town' },
        { name: 'Alley', value: 'https://picsum.photos/seed/alley/1920/1080', hint: 'city street' },
        { name: 'Buildings', value: 'https://picsum.photos/seed/buildings/1920/1080', hint: 'city buildings' },
        { name: 'Nightlife', value: 'https://picsum.photos/seed/nightlife/1920/1080', hint: 'city nightlife' },
    ],
    Tech: [
        { name: 'Circuit', value: 'https://picsum.photos/seed/circuit/1920/1080', hint: 'technology circuit' },
        { name: 'Code', value: 'https://picsum.photos/seed/coding/1920/1080', hint: 'technology code' },
        { name: 'Server', value: 'https://picsum.photos/seed/server/1920/1080', hint: 'technology server' },
        { name: 'Network', value: 'https://picsum.photos/seed/network/1920/1080', hint: 'technology network' },
        { name: 'Binary', value: 'https://picsum.photos/seed/binary/1920/1080', hint: 'technology binary' },
        { name: 'Hardware', value: 'https://picsum.photos/seed/hardware/1920/1080', hint: 'technology hardware' },
        { name: 'Processor', value: 'https://picsum.photos/seed/processor/1920/1080', hint: 'technology processor' },
        { name: 'Abstract', value: 'https://picsum.photos/seed/connect/1920/1080', hint: 'technology abstract' },
        { name: 'Hexagon', value: 'https://picsum.photos/seed/hexagon/1920/1080', hint: 'technology abstract' },
        { name: 'Futuristic', value: 'https://picsum.photos/seed/future/1920/1080', hint: 'technology futuristic' },
    ],
};

type Category = keyof typeof wallpaperCategories;
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
    const { addNotification } = useNotifications();
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
            addNotification({
                title: 'Wallpaper Diperbarui',
                description: 'Wallpaper latar belakang Anda telah diubah.',
                icon: ImageIcon,
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
                                <p className="text-white text-xs font-medium">{category === 'Tech' ? 'Tech' : category}</p>
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
