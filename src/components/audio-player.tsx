'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { audioService } from '@/lib/sound';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Initialize the service on mount. This creates the Audio element.
    audioService.initialize();
    setIsMounted(true);
    
    // Sync UI with the shared audio service state
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audioService.on('play', onPlay);
    audioService.on('pause', onPause);

    // Set initial state
    setIsPlaying(audioService.isPlaying);

    // Cleanup listeners
    return () => {
      audioService.off('play', onPlay);
      audioService.off('pause', onPause);
    };
  }, []);

  const togglePlayPause = () => {
    // This click from the user gives the browser permission
    // to play audio from the shared audioService instance.
    audioService.toggleBackgroundMusic();
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
