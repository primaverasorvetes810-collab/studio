'use client';

import { useEffect, useRef } from 'react';

type VideoOverlayProps = {
  src: string;
  onEnded: () => void;
};

export default function VideoOverlay({ src, onEnded }: VideoOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Effect to handle video playback
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Attempt to play the video automatically.
      video.play().catch(error => {
        // Autoplay can be blocked by browser policies.
        // Usually requires user interaction, which we have (button click).
        console.error("Error attempting to play video:", error);
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <video
        ref={videoRef}
        src={src}
        onEnded={onEnded}
        playsInline
        className="w-full max-w-lg h-auto"
      />
    </div>
  );
}
