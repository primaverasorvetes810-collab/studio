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
    
    const audioUrl = 'https://res.cloudinary.com/dh88bfqo0/video/upload/v1773510919/freesound_community-attention_tone_sm30-96953_knaykg.mp3';
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
      // If music is already playing, restart it to act as an alert
      if (this.isPlaying) {
          this.audio.currentTime = 0;
          return;
      }
      
      // If it's paused, try to play it.
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
          playPromise.catch(error => {
              console.log("Notification sound alert was blocked by the browser. A user interaction is required.");
          });
      }
    }
  }
}

export const audioService = new AudioService();
