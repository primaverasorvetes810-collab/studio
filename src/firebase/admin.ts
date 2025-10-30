import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// This is a server-only file.

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

const adminApp =
  getApps().find((app) => app.name === 'admin') ||
  initializeApp(
    {
      credential: serviceAccount ? cert(serviceAccount) : undefined,
      projectId: firebaseConfig.projectId,
    },
    'admin'
  );

const firestore = getFirestore(adminApp);

export function getFirebaseAdmin() {
  return { firestore };
}
