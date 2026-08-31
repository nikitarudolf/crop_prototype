import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  APP_KEY: Env.schema.secret(),
  DB_CONNECTION: Env.schema.enum(['sqlite'] as const),
  SQLITE_DB_PATH: Env.schema.string(),
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),
  APP_URL: Env.schema.string.optional({ format: 'url', tld: false }),
})
