'use client';
import { ref, uploadBytesResumable, getDownloadURL, type Storage } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a file to a specified path in Firebase Storage and provides progress updates.
 * @param storage The Firebase Storage instance.
 * @param file The file to upload.
 * @param path The storage path (e.g., 'products', 'carousel').
 * @param onProgress A callback function to receive upload progress (0-100).
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export const uploadFileAndGetURL = (
    storage: Storage,
    file: File,
    path: string,
    onProgress: (progress: number) => void
): Promise<string> => {
    return new Promise((resolve, reject) => {
        // Create a unique file name to avoid collisions
        const fileName = `${uuidv4()}-${file.name}`;
        const storageRef = ref(storage, `${path}/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
                reject(error);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (error) {
                    console.error("Failed to get download URL:", error);
                    reject(error);
                }
            }
        );
    });
};
