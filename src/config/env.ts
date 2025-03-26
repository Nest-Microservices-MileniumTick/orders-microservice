import 'dotenv/config';
import * as v from 'valibot';

const envSchema = v.object({
  PORT: v.pipe(
    v.string(),
    v.transform((input) => Number(input)),
  ),
  DATABASE_URL: v.pipe(v.string()),
  NATS_SERVERS: v.pipe(v.string(), v.transform((input) => input.split(',')))
});

export const ENV = v.parse(envSchema, process.env);
