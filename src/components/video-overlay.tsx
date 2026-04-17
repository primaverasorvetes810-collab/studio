'use client';

import { useEffect, useRef } from 'react';
// We no longer need Button or X for the close functionality
// import { Button } from './ui/button';
// import { X } from 'lucide-react';

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
        videoRef.current.play().catch(e => console.error("Video play error:", e));
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
      // Removed onClick={onClose} to prevent closing by clicking the background
    >
      <video
        ref={videoRef}
        src={videoSrc}
        className="max-h-[90vh] max-w-[90vw]"
        // Prevent clicks on the video from propagating and potentially closing the modal if the backdrop had an onClick
        onClick={(e) => e.stopPropagation()}
        autoPlay
        playsInline
        muted={false} // Ensuring sound plays
      />
      {/* The close button has been removed to ensure the video plays to completion */}
    </div>
  );
}
