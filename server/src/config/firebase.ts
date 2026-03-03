import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getEnv } from './env.js';

function ensureApp() {
  if (getApps().length === 0) {
    const env = getEnv();
    initializeApp({
      projectId: env.GOOGLE_CLOUD_PROJECT,
      storageBucket: env.GCS_BUCKET,
    });
  }
}

export function getDb() {
  ensureApp();
  return getFirestore();
}

export function getBucket() {
  ensureApp();
  return getStorage().bucket();
}
