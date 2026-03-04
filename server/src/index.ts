import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { getEnv } from './config/env.js';
import { projectRouter } from './routes/project.js';
import { streamRouter } from './routes/stream.js';
import { interactRouter } from './routes/interact.js';

const env = getEnv();
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/projects', projectRouter);
app.use('/api/stream', streamRouter);
app.use('/api/interact', interactRouter);

// In production, serve the client build
if (env.NODE_ENV === 'production') {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const publicDir = path.join(__dirname, '..', 'public');
  app.use(express.static(publicDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

app.listen(env.PORT, () => {
  console.log(`FilmSwarm server running on port ${env.PORT}`);
});
