import { neon } from '@neondatabase/serverless'
import type { NeonQueryFunction } from '@neondatabase/serverless'

// Lazy initialization to avoid build-time database connection
let sqlInstance: ReturnType<typeof neon> | null = null

function getSql() {
  if (!sqlInstance) {
    // Only initialize if DATABASE_URL is available (runtime, not build time)
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set')
    }
    sqlInstance = neon(dbUrl)
  }
  return sqlInstance
}

// Create a callable function that works as a template tag
// This proxies template tag calls to the lazily-initialized neon instance
const sqlTemplateTag = ((strings: TemplateStringsArray, ...values: unknown[]) => {
  const instance = getSql()
  return instance(strings, ...values)
}) as NeonQueryFunction<boolean, boolean>

export const sql = sqlTemplateTag


