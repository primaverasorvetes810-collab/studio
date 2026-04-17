'use client';

class SoundEffectsService {
  private clickSound: HTMLAudioElement | null = null;
  private isInitialized = false;

  initialize() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    const clickSoundUrl = 'https://res.cloudinary.com/du4ccw2pg/video/upload/v1776463053/soundreality-mouse-click-6-381778_swurot.mp3';
    this.clickSound = new Audio(clickSoundUrl);
    this.clickSound.preload = 'auto';
    this.isInitialized = true;
  }
  
  playClick() {
    this.initialize(); // Ensure initialized
    
    if (this.clickSound) {
      // To allow playing multiple times in quick succession, we clone the audio object.
      const audio = this.clickSound.cloneNode(true) as HTMLAudioElement;
      // Reset currentTime to play from the start if it's already playing.
      audio.currentTime = 0;
      audio.play().catch(e => console.error("Error playing click sound:", e));
    }
  }
}

export const soundEffectsService = new SoundEffectsService();
