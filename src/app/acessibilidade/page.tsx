'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sun, Moon, ZoomIn, ZoomOut } from "lucide-react";
import { useTheme } from '@/components/theme-provider';

export default function AccessibilityPage() {
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState(16); // Base font size in px

  // Load saved font size from local storage
  useEffect(() => {
    const savedSize = localStorage.getItem('font-size');
    if (savedSize) {
      const newSize = parseInt(savedSize, 10);
      setFontSize(newSize);
      document.documentElement.style.fontSize = `${newSize}px`;
    }
  }, []);

  const changeFontSize = (amount: number) => {
    setFontSize(prevSize => {
      const newSize = Math.max(12, Math.min(24, prevSize + amount)); // Clamp between 12px and 24px
      document.documentElement.style.fontSize = `${newSize}px`;
      localStorage.setItem('font-size', newSize.toString());
      return newSize;
    });
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader
        title="Acessibilidade"
        description="Ajuste a aparência do site para melhor atender às suas necessidades."
      />
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === 'light' ? <Sun className="text-yellow-500" /> : <Moon className="text-blue-300" />}
              Tema de Cores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Alterne entre o tema claro e o tema escuro para maior conforto visual.
            </p>
            <Button onClick={toggleTheme} variant="outline">
              Mudar para Tema {theme === 'light' ? 'Escuro' : 'Claro'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ZoomIn />
              Tamanho da Fonte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Aumente ou diminua o tamanho do texto em todo o site.
            </p>
            <div className="flex items-center gap-4">
              <Button onClick={() => changeFontSize(-2)} variant="outline" size="icon">
                <ZoomOut />
                <span className="sr-only">Diminuir fonte</span>
              </Button>
              <Label className="text-lg font-bold">{Math.round((fontSize / 16) * 100)}%</Label>
              <Button onClick={() => changeFontSize(2)} variant="outline" size="icon">
                <ZoomIn />
                <span className="sr-only">Aumentar fonte</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
