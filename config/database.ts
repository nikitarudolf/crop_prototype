import app from '@adonisjs/core/services/app'
import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: 'sqlite',

  prettyPrintDebugQueries: true,

  connections: {
    sqlite: {
      client: 'better-sqlite3',
      connection: {
        filename: app.makePath(env.get('SQLITE_DB_PATH')),
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
