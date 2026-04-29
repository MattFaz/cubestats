import { sqliteTable, integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const imports = sqliteTable('imports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filename: text('filename').notNull(),
  rawJson: text('raw_json').notNull(),
  solvesAdded: integer('solves_added').notNull().default(0),
  solvesSkipped: integer('solves_skipped').notNull().default(0),
  importedAt: integer('imported_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionKey: text('session_key').notNull().unique(),
  displayName: text('display_name').notNull(),
  puzzleType: text('puzzle_type').notNull().default('333'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const solves = sqliteTable(
  'solves',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sessionId: integer('session_id')
      .notNull()
      .references(() => sessions.id),
    importId: integer('import_id').references(() => imports.id),
    timeMs: integer('time_ms').notNull(),
    penalty: text('penalty').notNull().default('none'),
    scramble: text('scramble').notNull(),
    comment: text('comment'),
    solvedAt: integer('solved_at', { mode: 'timestamp' }).notNull(),
    moveHistory: text('move_history'),
    puzzleType: text('puzzle_type').notNull().default('333'),
  },
  (table) => [uniqueIndex('solve_dedup_idx').on(table.sessionId, table.solvedAt, table.scramble)],
)

export const goals = sqliteTable(
  'goals',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    metric: text('metric').notNull(),
    targetMs: integer('target_ms').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [uniqueIndex('goals_metric_unique_idx').on(table.metric)],
)
