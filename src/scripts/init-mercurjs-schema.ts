import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

/**
 * MercurJS Schema Initialization Script
 * 
 * ONE-TIME USE ONLY: Initializes database schema for MercurJS plugins.
 * 
 * MercurJS plugins (@mercurjs/b2c-core, @mercurjs/commission, etc.) come with
 * their own migrations. Since we're moving to a schema sync approach, we need
 * to run these migrations once to establish the base schema, then rely on
 * schema sync for future changes.
 * 
 * This script should be run once per environment, then can be removed or archived.
 * 
 * Usage:
 *   npm run init:mercurjs-schema
 *   mise exec -- npm run init:mercurjs-schema
 * 
 * After running:
 *   1. Verify all MercurJS tables exist in database
 *   2. Remove or archive this script
 *   3. Future schema changes will be handled by schema sync
 * 
 * IMPORTANT: This is a transitional script. In the future, you may want to:
 *   - Extract MercurJS entity definitions into your codebase
 *   - Override plugin entities with your own definitions
 *   - Fully control the schema without relying on plugin migrations
 */
export default async function initMercurJSSchema({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.warn('[MERCURJS-INIT] ⚠️  This is a ONE-TIME initialization script')
  logger.warn('[MERCURJS-INIT] It will run MercurJS plugin migrations to establish base schema')
  logger.info('[MERCURJS-INIT]')
  logger.info('[MERCURJS-INIT] Starting MercurJS schema initialization...')
  
  try {
    // Check if MercurJS tables already exist
    const orm = container.resolve('manager')
    
    if (!orm || !orm.config) {
      throw new Error('MikroORM instance not found in container')
    }
    
    // Run migrations for MercurJS plugins
    // This uses the built-in migration system one last time
    logger.info('[MERCURJS-INIT] Running MercurJS plugin migrations...')
    
    const migrator = orm.getMigrator()
    const pendingMigrations = await migrator.getPendingMigrations()
    
    if (pendingMigrations.length === 0) {
      logger.info('[MERCURJS-INIT] ✅ No pending migrations - MercurJS schema already initialized')
      logger.info('[MERCURJS-INIT] You can safely remove this script')
      return
    }
    
    logger.info(`[MERCURJS-INIT] Found ${pendingMigrations.length} pending migration(s)`)
    pendingMigrations.forEach(migration => {
      logger.info(`[MERCURJS-INIT]   - ${migration.name}`)
    })
    
    await migrator.up()
    
    logger.info('[MERCURJS-INIT] ✅ MercurJS schema initialized successfully')
    logger.info('[MERCURJS-INIT]')
    logger.info('[MERCURJS-INIT] Next steps:')
    logger.info('[MERCURJS-INIT]   1. Verify all tables exist in database')
    logger.info('[MERCURJS-INIT]   2. Remove or archive this script')
    logger.info('[MERCURJS-INIT]   3. Future changes will use schema sync automatically')
    
  } catch (error) {
    logger.error('[MERCURJS-INIT] ❌ MercurJS schema initialization failed:', error)
    logger.error('[MERCURJS-INIT] You may need to run migrations manually:')
    logger.error('[MERCURJS-INIT]   npx medusa db:migrate')
    process.exit(1)
  }
}
