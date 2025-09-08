
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme, type Color } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const colors: { name: Color, bgColor: string }[] = [
    { name: 'green', bgColor: 'bg-green-500' },
    { name: 'blue', bgColor: 'bg-blue-500' },
    { name: 'orange', bgColor: 'bg-orange-500' },
    { name: 'rose', bgColor: 'bg-rose-500' },
    { name: 'violet', bgColor: 'bg-violet-500' },
];

const defaultWallpapers = [
    { name: 'Default', value: 'https://picsum.photos/1920/1080?grayscale' },
    { name: 'Nature', value: 'https://picsum.photos/seed/nature/1920/1080' },
    { name: 'City', value: 'https://picsum.photos/seed/city/1920/1080' },
    { name: 'Tech', value: 'https://picsum.photos/seed/tech/1920/1080' },
];


export default function SettingsPage() {
    const router = useRouter();
    const { theme, setTheme, color, setColor, wallpaper, setWallpaper } = useTheme();
    const { toast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    
    // Ensure theme is not undefined during initial render
    const isDarkMode = theme === 'dark';

    const handleThemeChange = (checked: boolean) => {
        setTheme(checked ? 'dark' : 'light');
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check file size (e.g., 5MB limit)
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

    return (
        <div className="flex flex-col gap-8 max-w-2xl mx-auto">
            <Button variant="ghost" onClick={() => router.back()} className="self-start text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
            </Button>
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            </header>
            
            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Sesuaikan tampilan dan nuansa aplikasi.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                            {defaultWallpapers.map((wp) => (
                                <div
                                    key={wp.name}
                                    className={cn(
                                        "relative aspect-video rounded-md overflow-hidden cursor-pointer ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                                        (wallpaper === wp.value || (wallpaper === 'default' && wp.name === 'Default')) && "ring-2 ring-primary"
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
                                    />
                                    <div className="absolute inset-0 bg-black/30 flex items-end p-2">
                                        <p className="text-white text-xs font-medium">{wp.name}</p>
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
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
