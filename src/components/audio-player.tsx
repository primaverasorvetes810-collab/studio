'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

const audioUrl = 'https://res.cloudinary.com/dh88bfqo0/video/upload/v1773503835/MC_Ryan_SP_MC_Jacar%C3%A9_e_MC_Meno_K_DJ_Japa_NK_e_DJ_Davi_DogDog_-_POSSO_AT%C3%89_N%C3%83O_TE_DAR_FLORES_n5DbjaZMNSE_xy7kk9.mp3';

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // We need to create the audio element on the client side
    // to avoid SSR issues.
    if (typeof window !== 'undefined') {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.loop = true; // Loop the music
        setIsMounted(true);
    }

    return () => {
      // Cleanup: pause and nullify on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error("Audio playback failed:", error);
        // Handle autoplay policy errors if necessary
      });
    }
    setIsPlaying(!isPlaying);
  };
  
  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Button
        onClick={togglePlayPause}
        variant="outline"
        size="icon"
        className="rounded-full h-14 w-14 shadow-lg bg-background/80 backdrop-blur-sm"
        aria-label={isPlaying ? 'Pausar música' : 'Tocar música'}
      >
        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
      </Button>
    </div>
  );
}
