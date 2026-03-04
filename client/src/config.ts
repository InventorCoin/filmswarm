// In production, always hit Cloud Run directly (Firebase Hosting CDN kills SSE).
// In development, use relative URLs (same-origin dev server).
export const API_BASE = import.meta.env.PROD
  ? 'https://filmswarm-591339435677.us-central1.run.app'
  : '';
