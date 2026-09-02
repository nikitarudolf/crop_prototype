import app from '@adonisjs/core/services/app'
import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: env.get('DB_CONNECTION'),

  prettyPrintDebugQueries: true,

  connections: {
    sqlite: {
      client: 'better-sqlite3',
      connection: {
        filename: app.makePath(env.get('SQLITE_DB_PATH')),
      },
      pool: {
        afterCreate: (
          connection: { pragma: (statement: string) => void },
          done: (error: Error | null, connection: unknown) => void
        ) => {
          connection.pragma('foreign_keys = ON')
          done(null, connection)
        },
      },
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      debug: app.inDev,
    },
  },
})

export default dbConfig
