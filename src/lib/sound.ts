'use client';

type Event = 'play' | 'pause';
type Callback = () => void;

class AudioService {
  private audio: HTMLAudioElement | null = null;
  private isInitialized = false;
  public isPlaying = false;
  private listeners: { [key in Event]?: Callback[] } = {};

  // --- Event Emitter Methods ---
  on(event: Event, callback: Callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]?.push(callback);
  }

  off(event: Event, callback: Callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event]?.filter(cb => cb !== callback);
  }

  private emit(event: Event) {
    this.listeners[event]?.forEach(cb => cb());
  }
  // --- End Event Emitter ---

  initialize() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    const audioUrl = 'https://res.cloudinary.com/dh88bfqo0/video/upload/v1773503835/MC_Ryan_SP_MC_Jacar%C3%A9_e_MC_Meno_K_DJ_Japa_NK_e_DJ_Davi_DogDog_-_POSSO_AT%C3%89_N%C3%83O_TE_DAR_FLORES_n5DbjaZMNSE_xy7kk9.mp3';
    this.audio = new Audio(audioUrl);
    this.audio.loop = true; // Loop for background music
    this.audio.preload = 'auto';
    this.isInitialized = true;

    this.audio.onplay = () => {
      this.isPlaying = true;
      this.emit('play');
    };
    this.audio.onpause = () => {
      this.isPlaying = false;
      this.emit('pause');
    };
  }

  toggleBackgroundMusic() {
    if (!this.audio) this.initialize();
    if (this.audio) {
      if (this.isPlaying) {
        this.audio.pause();
      } else {
        // This click gives the browser permission to play audio.
        this.audio.play().catch(e => console.error("Error playing background music:", e));
      }
    }
  }

  playNotificationAlert() {
    if (!this.audio) this.initialize();
    
    if (this.audio) {
      // Always play from the beginning for an alert
      this.audio.currentTime = 0;
      
      // If it's paused, play it.
      if (this.audio.paused) {
          const playPromise = this.audio.play();
          if (playPromise !== undefined) {
              playPromise.catch(error => {
                  console.log("Notification sound alert was blocked by the browser. A user interaction is required.");
              });
          }
      }
    }
  }
}

export const audioService = new AudioService();
