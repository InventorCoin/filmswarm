import { z } from 'zod';

const envSchema = z.object({
  GOOGLE_API_KEY: z.string().min(1),
  GOOGLE_CLOUD_PROJECT: z.string().min(1),
  GCS_BUCKET: z.string().min(1),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (!_env) {
    _env = envSchema.parse(process.env);
  }
  return _env;
}
