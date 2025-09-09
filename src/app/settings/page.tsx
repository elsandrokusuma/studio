
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Upload, Image as ImageIcon, Palette, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme, type Color } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


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
        value: `https://picsum.photos/seed/nature${i + 1}/1920/1080`,
    })),
    City: Array.from({ length: 10 }, (_, i) => ({
        name: `City ${i + 1}`,
        value: `https://picsum.photos/seed/city${i + 1}/1920/1080`,
    })),
    Tech: Array.from({ length: 10 }, (_, i) => ({
        name: `Tech ${i + 1}`,
        value: `https://picsum.photos/seed/tech${i + 1}/1920/1080`,
    })),
};

type Category = keyof typeof wallpaperCategories;

export default function SettingsPage() {
    const router = useRouter();
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
        <div className="flex flex-col gap-8 max-w-2xl mx-auto">
            <Button variant="ghost" onClick={() => router.back()} className="self-start text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
            </Button>
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            </header>
            
            <Card>
                <CardContent className="p-0">
                    <Accordion type="single" collapsible defaultValue="appearance" className="w-full">
                        <AccordionItem value="appearance" className="border-0">
                            <AccordionTrigger className="p-6 text-lg font-semibold hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-md">
                                        <Palette className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p>Appearance</p>
                                        <p className="text-sm font-normal text-muted-foreground text-left">Sesuaikan tampilan dan nuansa aplikasi.</p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6">
                                <div className="space-y-8 pt-4 border-t">
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
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
