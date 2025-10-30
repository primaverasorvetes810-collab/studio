
import { initializeApp, getApps, cert, App, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

let adminApp: App;

if (!getApps().some((app) => app.name === 'admin')) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      adminApp = initializeApp(
        {
          credential: cert(serviceAccount),
          projectId: firebaseConfig.projectId,
        },
        'admin'
      );
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Falling back to Application Default Credentials.', e);
      adminApp = initializeApp({
        credential: applicationDefault(),
        projectId: firebaseConfig.projectId,
      }, 'admin');
    }
  } else {
    // This is the default case for environments like Firebase App Hosting
    adminApp = initializeApp({
      credential: applicationDefault(),
      projectId: firebaseConfig.projectId,
    }, 'admin');
  }
} else {
  adminApp = getApps().find((app) => app.name === 'admin')!;
}

const firestoreAdmin = getFirestore(adminApp);

export function getFirebaseAdmin() {
  return { firestore: firestoreAdmin };
}
