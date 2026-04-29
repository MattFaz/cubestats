import { pgTable, serial, varchar, text, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const imports = pgTable('imports', {
  id: serial('id').primaryKey(),
  filename: varchar('filename', { length: 255 }).notNull(),
  rawJson: text('raw_json').notNull(),
  solvesAdded: integer('solves_added').notNull().default(0),
  solvesSkipped: integer('solves_skipped').notNull().default(0),
  importedAt: timestamp('imported_at').notNull().defaultNow(),
})

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  sessionKey: varchar('session_key', { length: 50 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  puzzleType: varchar('puzzle_type', { length: 20 }).notNull().default('333'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const solves = pgTable('solves', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').notNull().references(() => sessions.id),
  importId: integer('import_id').references(() => imports.id),
  timeMs: integer('time_ms').notNull(),
  penalty: varchar('penalty', { length: 10 }).notNull().default('none'),
  scramble: text('scramble').notNull(),
  comment: text('comment'),
  solvedAt: timestamp('solved_at').notNull(),
  moveHistory: text('move_history'),
  puzzleType: varchar('puzzle_type', { length: 20 }).notNull().default('333'),
}, (table) => [
  uniqueIndex('solve_dedup_idx').on(table.sessionId, table.solvedAt, table.scramble),
])

export const goals = pgTable('goals', {
  id: serial('id').primaryKey(),
  metric: varchar('metric', { length: 20 }).notNull(),
  targetMs: integer('target_ms').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  uniqueIndex('goals_metric_unique_idx').on(table.metric),
])
