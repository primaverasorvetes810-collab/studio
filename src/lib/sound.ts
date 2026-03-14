'use client';

type EventCallback = () => void;

class AudioService {
  private audio: HTMLAudioElement | null = null;
  private isInitialized = false;
  private audioUrl: string;
  private listeners: Record<string, EventCallback[]> = {};

  constructor(audioUrl: string) {
    this.audioUrl = audioUrl;
  }

  private emit(event: 'play' | 'pause') {
    this.listeners[event]?.forEach(callback => callback());
  }
  
  on(event: 'play' | 'pause', callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: 'play' | 'pause', callback: EventCallback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  initialize() {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }
    
    this.audio = new Audio(this.audioUrl);
    this.audio.preload = 'auto';

    this.audio.onplay = () => this.emit('play');
    this.audio.onpause = () => this.emit('pause');
    this.audio.onended = () => {
        // When a non-looping sound (like a notification) ends, it stops playing.
        // Firing 'pause' makes the UI update correctly.
        if (!this.audio?.loop) {
            this.emit('pause'); 
        }
    };

    this.isInitialized = true;
  }

  get isPlaying(): boolean {
      return !!this.audio && !this.audio.paused;
  }

  playNotification() {
    if (!this.audio) this.initialize();
    
    if (this.audio) {
      // If music is already playing (as background), just restart it as an alert.
      if (!this.audio.paused) {
        this.audio.currentTime = 0;
      } else {
        // If paused, try to play it as a one-shot notification.
        // This may be blocked by the browser if there's no recent user interaction.
        this.audio.loop = false;
        this.audio.currentTime = 0;
        const playPromise = this.audio.play();

        if (playPromise !== undefined) {
          playPromise.catch(error => {
            // This error is expected if the user hasn't interacted with the page.
            console.log("Notification sound was blocked by the browser, which is expected without recent user interaction.");
          });
        }
      }
    }
  }

  toggleBackgroundMusic() {
      if (!this.audio) this.initialize();
      if (!this.audio) return;

      if (this.isPlaying) {
          this.audio.pause();
      } else {
          this.audio.loop = true;
          // Don't reset time for toggle, just resume
          const playPromise = this.audio.play();
          if (playPromise !== undefined) {
              playPromise.catch(error => console.error("Background music playback failed:", error));
          }
      }
  }
}

const audioUrl = 'https://res.cloudinary.com/dh88bfqo0/video/upload/v1773503835/MC_Ryan_SP_MC_Jacar%C3%A9_e_MC_Meno_K_DJ_Japa_NK_e_DJ_Davi_DogDog_-_POSSO_AT%C3%89_N%C3%83O_TE_DAR_FLORES_n5DbjaZMNSE_xy7kk9.mp3';

export const audioService = new AudioService(audioUrl);

export function initializeAudio() {
  audioService.initialize();
}

export function playNotificationSound() {
  audioService.playNotification();
}
