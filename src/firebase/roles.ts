'use client';

import { doc, setDoc } from 'firebase/firestore';
import { getClientSdks } from '@/firebase';
import { setDocumentNonBlocking } from './non-blocking-updates';

/**
 * Promotes a user to an admin role by creating a document in the 'roles_admin' collection.
 * This operation is non-blocking.
 * @param uid The user's unique ID.
 * @param email The user's email, stored for reference.
 */
export function promoteUserToAdmin(uid: string, email: string) {
  const { firestore } = getClientSdks();
  const adminRoleRef = doc(firestore, 'roles_admin', uid);
  
  // The `setDocumentNonBlocking` function will handle potential permission errors
  // by emitting a global 'permission-error' event.
  setDocumentNonBlocking(adminRoleRef, { email }, { merge: true });
}
