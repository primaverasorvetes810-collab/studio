'use client';

// Create a single Audio object instance to be reused.
// This can help with browser autoplay policies, as the element exists before play() is called.
let notificationAudio: HTMLAudioElement | null = null;

// Function to initialize the audio element.
// We can call this once when the app loads or a relevant component mounts.
export function initializeAudio() {
  if (typeof window !== 'undefined' && !notificationAudio) {
    notificationAudio = new Audio('https://www.soundjay.com/misc/sounds/alarm-clock-01.mp3');
    notificationAudio.preload = 'auto';
  }
}

// Function to play the sound.
export function playNotificationSound() {
  // Ensure audio is initialized
  if (!notificationAudio) {
    initializeAudio();
  }

  if (notificationAudio) {
    // Rewind to the start in case it's played again quickly
    notificationAudio.currentTime = 0;
    
    // play() returns a promise which can be used to handle errors.
    const playPromise = notificationAudio.play();

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error("Audio playback failed:", error);
        // In a real app, you might want to inform the user that audio is blocked.
      });
    }
  }
}
