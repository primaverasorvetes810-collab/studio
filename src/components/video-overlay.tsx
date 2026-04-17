'use client';

import { useEffect, useRef } from 'react';

interface VideoOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
}

export default function VideoOverlay({ isOpen, onClose, videoSrc }: VideoOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
        videoRef.current.currentTime = 0;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            // Ignore AbortError which can happen if component unmounts quickly.
            if (error.name !== 'AbortError') {
              console.error("Video play error:", error);
            }
          });
        }
    } else if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // This function will be called when the video finishes playing
    const handleVideoEnd = () => {
        onClose();
    }

    const currentVideoRef = videoRef.current;
    
    // Add event listener for when the video ends
    currentVideoRef?.addEventListener('ended', handleVideoEnd);

    // Cleanup function to remove the event listener
    return () => {
      currentVideoRef?.removeEventListener('ended', handleVideoEnd);
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <video
        ref={videoRef}
        src={videoSrc}
        className="max-h-[90vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
        autoPlay
        playsInline
        muted={false}
      />
    </div>
  );
}
