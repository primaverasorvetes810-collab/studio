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
        videoRef.current.playbackRate = 0.75; // Play at 75% speed to make it longer
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
    if (!videoRef.current) return;

    const handleVideoEnd = () => {
      onClose();
    };

    const currentVideo = videoRef.current;
    currentVideo.addEventListener('ended', handleVideoEnd);

    return () => {
      currentVideo.removeEventListener('ended', handleVideoEnd);
    };
  }, [onClose]);

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
        className="max-h-[90vh] max-w-[90vw]"
        autoPlay
        playsInline
        muted={false}
        onClick={(e) => e.stopPropagation()}
      >
        <source src={videoSrc} type="video/mp4" />
        Seu navegador não suporta o player de vídeo.
      </video>
    </div>
  );
}
