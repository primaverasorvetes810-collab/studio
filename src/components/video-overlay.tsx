'use client';

import { useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { X } from 'lucide-react';

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

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleVideoEnd = () => {
        onClose();
    }

    const currentVideoRef = videoRef.current;
    currentVideoRef?.addEventListener('ended', handleVideoEnd);
    window.addEventListener("keydown", handleEsc);

    return () => {
      currentVideoRef?.removeEventListener('ended', handleVideoEnd);
      window.removeEventListener("keydown", handleEsc);
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
      onClick={onClose}
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
