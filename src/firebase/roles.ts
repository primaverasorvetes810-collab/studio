'use client';
import { doc, setDoc } from 'firebase/firestore';
import { getClientSdks } from '@/firebase';
import { setDocumentNonBlocking } from './non-blocking-updates';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

/**
 * Promotes a user to an admin role by creating a document in the 'roles_admin' collection.
 * This function does not await the result, allowing for a non-blocking UI.
 * Errors are caught and emitted globally.
 *
 * @param userId - The ID of the user to promote.
 * @param userEmail - The email of the user, stored for easier identification.
 */
export function promoteUserToAdmin(userId: string, userEmail: string): Promise<void> {
  const { firestore } = getClientSdks();
  const adminRoleRef = doc(firestore, 'roles_admin', userId);

  // We are returning the promise here so we can use .then() and .catch() in the component
  return setDoc(adminRoleRef, { email: userEmail })
    .catch((error) => {
      // Create and emit a contextual permission error for debugging.
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: adminRoleRef.path,
          operation: 'create',
          requestResourceData: { email: userEmail },
        })
      );
      // Re-throw the error so the component's .catch() block can handle it.
      throw error;
    });
}
