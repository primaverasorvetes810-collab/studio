import { initializeApp, getApps, cert, App, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// This is a server-only file.

function createAdminApp(): App {
  if (getApps().some((app) => app.name === 'admin')) {
    return getApps().find((app) => app.name === 'admin')!;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      return initializeApp(
        {
          credential: cert(serviceAccount),
          projectId: firebaseConfig.projectId,
        },
        'admin'
      );
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Falling back to Application Default Credentials.', e);
    }
  }

  // If service account key is not available or parsing fails,
  // use Application Default Credentials. This is the standard for server-side Google Cloud environments.
  return initializeApp({
    credential: applicationDefault(),
    projectId: firebaseConfig.projectId,
  }, 'admin');
}

export function getFirebaseAdmin() {
  const app = createAdminApp();
  const firestore = getFirestore(app);
  return { firestore };
}
