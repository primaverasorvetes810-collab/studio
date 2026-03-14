'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { audioService } from '@/lib/sound';

type AudioPlayerProps = {
  hasPendingOrders: boolean;
};

export default function AudioPlayer({ hasPendingOrders }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Effect to sync with the audio service's state
  useEffect(() => {
    audioService.initialize();
    setIsMounted(true);
    
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audioService.on('play', onPlay);
    audioService.on('pause', onPause);
    setIsPlaying(audioService.isPlaying);

    return () => {
      audioService.off('play', onPlay);
      audioService.off('pause', onPause);
      audioService.pause(); // Cleanup on unmount
    };
  }, []);

  // Main logic effect
  useEffect(() => {
    if (hasPendingOrders) {
      // If there are pending orders, we want the sound to play.
      // The user's first interaction with the toggle button will grant permission.
      // After that, this will automatically play.
      audioService.play();
    } else {
      // If no pending orders, always stop the sound.
      audioService.pause();
    }
  }, [hasPendingOrders]);
  
  // Don't render the button until mounted or if there are no pending orders.
  if (!isMounted || !hasPendingOrders) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Button
        onClick={() => audioService.toggle()}
        variant="outline"
        size="icon"
        className="rounded-full h-14 w-14 shadow-lg bg-background/80 backdrop-blur-sm"
        aria-label={isPlaying ? 'Pausar alerta sonoro' : 'Tocar alerta sonoro'}
      >
        {isPlaying ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
      </Button>
    </div>
  );
}
