import { useDrizzle, schema } from '../../database'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = useDrizzle()
  const imports = await db.select({
    id: schema.imports.id,
    filename: schema.imports.filename,
    solvesAdded: schema.imports.solvesAdded,
    solvesSkipped: schema.imports.solvesSkipped,
    importedAt: schema.imports.importedAt,
  }).from(schema.imports).orderBy(desc(schema.imports.importedAt))

  return imports
})
