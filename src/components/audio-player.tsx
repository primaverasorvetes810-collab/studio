'use client';

import { useEffect } from 'react';
import { audioService } from '@/lib/sound';

type AudioPlayerProps = {
  hasPendingOrders: boolean;
};

export default function AudioPlayer({ hasPendingOrders }: AudioPlayerProps) {
  useEffect(() => {
    // Ensure the audio service is initialized
    audioService.initialize();

    if (hasPendingOrders) {
      // If there are pending orders, we want the sound to play.
      // The browser should allow this as the user has interacted with the site
      // to get to the admin page.
      audioService.play();
    } else {
      // If no pending orders, always stop the sound.
      audioService.pause();
    }

    // On component unmount, for safety, we pause the sound.
    return () => {
      audioService.pause();
    };
  }, [hasPendingOrders]);

  // This component no longer renders a UI button, it just manages the sound.
  return null;
}
