'use client';

import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface ConfettiScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfettiScreen({ isOpen, onClose }: ConfettiScreenProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const { innerWidth, innerHeight } = window;
    setDimensions({ width: innerWidth, height: innerHeight });

    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Confetti
        width={dimensions.width}
        height={dimensions.height}
        recycle={true}
        numberOfPieces={400}
        gravity={0.1}
      />
      <div className="relative flex flex-col items-center gap-4 text-center">
        <h1 
          className="text-6xl md:text-8xl font-black uppercase text-white"
          style={{
            color: '#ff003c',
            textShadow: '0 0 5px #ff003c, 0 0 10px #ff003c, 0 0 20px #ff003c, 0 0 40px #ff003c, 0 0 80px #ff003c',
          }}
        >
          Pedido Finalizado
        </h1>
        <p className="text-lg text-white/80">
          Verifique o status dos seus pedidos para acompanhar a entrega.
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white"
      >
        <X className="h-8 w-8" />
        <span className="sr-only">Fechar</span>
      </Button>
    </div>
  );
}
