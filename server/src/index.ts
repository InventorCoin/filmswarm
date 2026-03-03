import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getEnv } from './config/env.js';
import { projectRouter } from './routes/project.js';
import { streamRouter } from './routes/stream.js';
import { interactRouter } from './routes/interact.js';

const env = getEnv();
const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/projects', projectRouter);
app.use('/api/stream', streamRouter);
app.use('/api/interact', interactRouter);

app.listen(env.PORT, () => {
  console.log(`FilmSwarm server running on port ${env.PORT}`);
});
