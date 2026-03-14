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
    this.audio.loop = true; // Alerts should loop
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
  
  play() {
    if (!this.audio) this.initialize();
    if (this.audio && !this.isPlaying) {
        // This gives permission and starts playing.
        this.audio.play().catch(e => console.error("Error playing alert sound:", e));
    }
  }
  
  pause() {
     if (this.audio && this.isPlaying) {
        this.audio.pause();
     }
  }

  toggle() {
    if (this.isPlaying) {
        this.pause();
    } else {
        this.play();
    }
  }
}

export const audioService = new AudioService();
