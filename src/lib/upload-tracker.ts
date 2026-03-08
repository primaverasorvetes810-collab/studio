'use client';

// A simple global tracker to know if there are uploads in progress.
// This helps prevent accidental navigation/logout during an upload.
class UploadTracker {
  private count = 0;

  public increment() {
    this.count++;
  }

  public decrement() {
    if (this.count > 0) {
      this.count--;
    }
  }

  public hasPendingUploads(): boolean {
    return this.count > 0;
  }
}

export const uploadTracker = new UploadTracker();
