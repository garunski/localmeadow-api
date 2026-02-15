import { LoaderOptions } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

/**
 * Schema Synchronization Loader
 * 
 * Automatically synchronizes database schema with defined models on application startup.
 * This replaces the traditional migration-based approach with a deterministic schema sync.
 * 
 * Features:
 * - Automatically detects schema differences
 * - Applies changes safely (no destructive operations in production)
 * - Ensures database exists before sync
 * - Logs all schema changes
 * 
 * Environment Variables:
 * - SCHEMA_SYNC_ENABLED: Enable/disable schema sync (default: true in development, false in production)
 * - SCHEMA_SYNC_SAFE_MODE: Only allow safe operations (default: true in production, false in development)
 */
export default async function schemaSyncLoader({
  container
}: LoaderOptions) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  // Configuration from environment
  const nodeEnv = process.env.NODE_ENV || 'development'
  const isProduction = nodeEnv === 'production'
  const syncEnabled = process.env.SCHEMA_SYNC_ENABLED !== 'false' // Enabled by default
  const safeMode = process.env.SCHEMA_SYNC_SAFE_MODE === 'true' || isProduction
  
  if (!syncEnabled) {
    logger.info('[SCHEMA-SYNC] Schema synchronization is disabled')
    return
  }
  
  logger.info('[SCHEMA-SYNC] Starting database schema synchronization...')
  logger.info(`[SCHEMA-SYNC] Mode: ${safeMode ? 'SAFE (no destructive operations)' : 'FULL'}`)
  
  try {
    // Resolve MikroORM instance from container
    // MedusaJS v2 registers MikroORM in the container
    const orm = container.resolve('manager')
    
    if (!orm || !orm.config) {
      throw new Error('MikroORM instance not found in container')
    }
    
    const schemaGenerator = orm.getSchemaGenerator()
    
    // Ensure database exists
    logger.info('[SCHEMA-SYNC] Ensuring database exists...')
    await schemaGenerator.ensureDatabase()
    
    // Get schema differences
    logger.info('[SCHEMA-SYNC] Checking for schema differences...')
    const updateSQL = await schemaGenerator.getUpdateSchemaSQL({ 
      wrap: false,
      safe: safeMode 
    })
    
    if (updateSQL.length === 0) {
      logger.info('[SCHEMA-SYNC] ✅ Schema is up to date - no changes needed')
      return
    }
    
    // Log the changes that will be applied
    logger.info('[SCHEMA-SYNC] Schema differences detected:')
    updateSQL.forEach((sql, index) => {
      logger.info(`[SCHEMA-SYNC]   ${index + 1}. ${sql}`)
    })
    
    // Apply schema updates
    logger.info('[SCHEMA-SYNC] Applying schema updates...')
    await schemaGenerator.updateSchema({ 
      safe: safeMode,
      wrap: false 
    })
    
    logger.info(`[SCHEMA-SYNC] ✅ Successfully applied ${updateSQL.length} schema change(s)`)
    
  } catch (error) {
    logger.error('[SCHEMA-SYNC] ❌ Schema synchronization failed:', error)
    
    // In production, fail fast - don't start the app with schema issues
    if (isProduction) {
      throw new Error(`Schema synchronization failed: ${error.message}`)
    }
    
    // In development, warn but continue
    logger.warn('[SCHEMA-SYNC] Continuing application startup despite schema sync failure')
  }
}
