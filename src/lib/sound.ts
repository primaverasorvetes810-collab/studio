'use client';

// A singleton class to manage a single Audio instance.
class AudioService {
  private audio: HTMLAudioElement | null = null;
  private isInitialized = false;

  /**
   * Initializes the Audio element. Should be called once when the app loads.
   * This is safe to call multiple times.
   */
  initialize() {
    // Avoid re-initializing in a client-side environment
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }
    
    const audioUrl = 'https://res.cloudinary.com/dh88bfqo0/video/upload/v1773503835/MC_Ryan_SP_MC_Jacar%C3%A9_e_MC_Meno_K_DJ_Japa_NK_e_DJ_Davi_DogDog_-_POSSO_AT%C3%89_N%C3%83O_TE_DAR_FLORES_n5DbjaZMNSE_xy7kk9.mp3';
    this.audio = new Audio(audioUrl);
    this.audio.preload = 'auto'; // Preload the audio file
    this.isInitialized = true;
  }

  /**
   * Attempts to play the notification sound from the beginning.
   * This requires a prior user interaction with the page to succeed in most browsers.
   */
  playNotification() {
    // Ensure the audio is initialized
    if (!this.audio) this.initialize();
    
    if (this.audio) {
      this.audio.currentTime = 0; // Always play from the start for an alert
      const playPromise = this.audio.play();

      // The play() method returns a promise. We should handle potential errors,
      // which are common due to browser autoplay policies.
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // This error is expected if the user hasn't interacted with the page yet.
          // We log it for debugging but don't show a toast, as it's not a "bug".
          console.log("Audio playback was blocked by the browser. A user interaction (like clicking the 'test notification' button) is required to enable sound.");
        });
      }
    }
  }
}

// Create a single, shared instance of the AudioService.
const audioService = new AudioService();

/**
 * A hook or component should call this once on mount to set up the audio element.
 */
export function initializeAudio() {
  audioService.initialize();
}

/**
 * Call this function to attempt to play the notification sound.
 */
export function playNotificationSound() {
  audioService.playNotification();
}
