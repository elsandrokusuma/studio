
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme, type Color } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

const colors: { name: Color, bgColor: string }[] = [
    { name: 'green', bgColor: 'bg-green-500' },
    { name: 'blue', bgColor: 'bg-blue-500' },
    { name: 'orange', bgColor: 'bg-orange-500' },
    { name: 'rose', bgColor: 'bg-rose-500' },
    { name: 'violet', bgColor: 'bg-violet-500' },
];

export default function SettingsPage() {
    const router = useRouter();
    const { theme, setTheme, color, setColor } = useTheme();
    
    // Ensure theme is not undefined during initial render
    const isDarkMode = theme === 'dark';

    const handleThemeChange = (checked: boolean) => {
        setTheme(checked ? 'dark' : 'light');
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
                    <CardDescription>Customize the look and feel of the app.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="dark-mode">Dark Mode</Label>
                            <p className="text-sm text-muted-foreground">Enable or disable the dark theme.</p>
                        </div>
                        <Switch
                            id="dark-mode"
                            checked={isDarkMode}
                            onCheckedChange={handleThemeChange}
                        />
                    </div>

                    <div className="space-y-2">
                       <div>
                            <Label>Theme Color</Label>
                            <p className="text-sm text-muted-foreground">Select your preferred theme color.</p>
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
                </CardContent>
            </Card>
        </div>
    );
}
