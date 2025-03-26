import 'dotenv/config';
import * as v from 'valibot';

const envSchema = v.object({
  PORT: v.pipe(
    v.string(),
    v.transform((input) => Number(input)),
  ),
  DATABASE_URL: v.pipe(v.string()),
  PRODUCTS_MICROSERVICE_HOST: v.pipe(v.string()),
  PRODUCTS_MICROSERVICE_PORT: v.pipe(
    v.string(),
    v.transform((input) => Number(input)),
  ),

});

export const ENV = v.parse(envSchema, process.env);
