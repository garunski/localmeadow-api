import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

/**
 * Schema Verification Script
 * 
 * Verifies that the database schema is in sync with the defined models.
 * Useful for:
 * - CI/CD pipelines to detect schema drift
 * - Pre-deployment checks
 * - Development debugging
 * 
 * Usage:
 *   npm run db:verify
 *   mise exec -- npm run db:verify
 * 
 * Exit codes:
 *   0 - Schema is in sync
 *   1 - Schema is out of sync or verification failed
 */
export default async function verifySchema({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info('[SCHEMA-VERIFY] Checking database schema...')
  
  try {
    // Resolve MikroORM instance from container
    const orm = container.resolve('manager')
    
    if (!orm || !orm.config) {
      throw new Error('MikroORM instance not found in container')
    }
    
    const schemaGenerator = orm.getSchemaGenerator()
    
    // Get schema differences
    const updateSQL = await schemaGenerator.getUpdateSchemaSQL({ 
      wrap: false,
      safe: true 
    })
    
    if (updateSQL.length === 0) {
      logger.info('[SCHEMA-VERIFY] ✅ Schema is in sync - no changes needed')
      process.exit(0)
    }
    
    // Schema is out of sync - log the differences
    logger.warn('[SCHEMA-VERIFY] ⚠️  Schema is out of sync!')
    logger.warn('[SCHEMA-VERIFY] Pending changes that would be applied:')
    logger.warn('[SCHEMA-VERIFY]')
    
    updateSQL.forEach((sql, index) => {
      logger.warn(`[SCHEMA-VERIFY]   ${index + 1}. ${sql}`)
    })
    
    logger.warn('[SCHEMA-VERIFY]')
    logger.warn('[SCHEMA-VERIFY] To sync the schema:')
    logger.warn('[SCHEMA-VERIFY]   - Start the application: mise run dev')
    logger.warn('[SCHEMA-VERIFY]   - Schema will sync automatically on startup')
    
    process.exit(1)
    
  } catch (error) {
    logger.error('[SCHEMA-VERIFY] ❌ Schema verification failed:', error)
    process.exit(1)
  }
}
