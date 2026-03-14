'use client';

import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { getClientSdks, useDoc, useMemoFirebase } from '@/firebase';
import { z } from 'zod';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';


export const STORE_SETTINGS_DOC_ID = 'global';

export const StoreSettingsSchema = z.object({
  id: z.string(),
  isOpen: z.boolean().default(true),
  notice: z.string().optional().default('A loja está temporariamente fechada.'),
});

export type StoreSettings = z.infer<typeof StoreSettingsSchema>;

/**
 * Hook to get the current store settings in real-time.
 * Initializes the settings document if it doesn't exist.
 */
export function useStoreSettings() {
  const { firestore } = getClientSdks();
  
  const settingsDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'storeSettings', STORE_SETTINGS_DOC_ID) : null),
    [firestore]
  );
  
  const { data: settings, isLoading, error } = useDoc<StoreSettings>(settingsDocRef);

  // Initialize the document if it doesn't exist.
  // This is a one-time operation if the document is missing.
  if (!isLoading && !error && !settings && settingsDocRef) {
     const initialSettings = { isOpen: true, notice: 'A loja está temporariamente fechada.' };
     setDoc(settingsDocRef, initialSettings).catch(e => {
        // This might fail due to permissions, but the hook will retry on next render.
        // We can also emit a global error for visibility.
        console.error("Failed to initialize store settings:", e);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: settingsDocRef.path,
            operation: 'create',
            requestResourceData: initialSettings
        }));
     });
  }

  return { settings, isLoading, error };
}

/**
 * Updates the global store settings.
 * @param {Partial<Omit<StoreSettings, 'id'>>} payload - The settings to update.
 */
export async function updateStoreSettings(payload: Partial<Omit<StoreSettings, 'id'>>) {
  const { firestore } = getClientSdks();
  const settingsDocRef = doc(firestore, 'storeSettings', STORE_SETTINGS_DOC_ID);
  
  try {
    await updateDoc(settingsDocRef, payload);
  } catch(e) {
    console.error("Failed to update store settings:", e);
    errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: settingsDocRef.path,
        operation: 'update',
        requestResourceData: payload
    }));
    throw e; // Re-throw so the UI can catch it
  }
}
