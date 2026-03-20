'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import confetti from 'canvas-confetti';

interface OrderSuccessOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderSuccessOverlay({ isOpen, onClose }: OrderSuccessOverlayProps) {
  const animationInterval = useRef<NodeJS.Timeout | null>(null);

  // Effect for confetti animation
  useEffect(() => {
    if (isOpen) {
      // Start confetti
      animationInterval.current = setInterval(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }, 800);
    } else {
        if (animationInterval.current) {
            clearInterval(animationInterval.current);
        }
    }

    // Cleanup function
    return () => {
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
      }
    };
  }, [isOpen]);


  // Effect for handling Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);


  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-success-title"
    >
      <div className="relative flex flex-col items-center gap-4 text-center">
        <h1 
          id="order-success-title"
          className="text-6xl md:text-8xl font-black uppercase text-destructive"
          style={{
            textShadow: '0 0 5px hsl(var(--destructive)), 0 0 10px hsl(var(--destructive)), 0 0 20px hsl(var(--destructive))',
          }}
        >
          Pedido Finalizado
        </h1>
        <p className="text-base text-gray-200">
          Verifique o status dos seus pedidos para acompanhar a entrega.
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white"
        aria-label="Fechar"
      >
        <X className="h-8 w-8" />
      </Button>
    </div>
  );
}
