'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { getClientSdks } from '@/firebase';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  const { firestore } = getClientSdks();
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(userCredential => {
      // User created, now create a document in 'users' collection
      const user = userCredential.user;
      const userRef = doc(firestore, 'users', user.uid);
      // Use setDoc to create the user document. It won't be awaited here
      // but will be handled by Firestore in the background.
      // Errors will be caught by the global handler if rules fail.
      const userData = {
        email: user.email,
        registerTime: serverTimestamp(),
      };
      setDoc(userRef, userData).catch(error => {
        // This is a failsafe. If creating the user document fails due
        // to permissions, the global error handler will catch it.
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: `users/${user.uid}`,
            operation: 'create',
            requestResourceData: userData,
          })
        );
      });
    })
    .catch(error => {
      // Auth errors (like email-already-in-use) are already thrown by onAuthStateChanged
      // and will be caught by the FirebaseErrorListener. We don't need to re-emit.
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password);
}
