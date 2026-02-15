import { model } from '@medusajs/framework/utils'

/**
 * Custom Domain Entity
 * 
 * Maps custom domains to seller IDs for multi-tenant seller storefronts.
 * This model is automatically synced to the database by the schema-sync module.
 */
const CustomDomain = model.define('custom_domain', {
  id: model.id().primaryKey(),
  domain: model.text().unique(),
  seller_id: model.text(),
  verified: model.boolean().default(false),
  verification_token: model.text().nullable(),
  ssl_enabled: model.boolean().default(false),
  created_at: model.dateTime().default('now'),
  updated_at: model.dateTime().default('now').onUpdate('now')
})

export default CustomDomain
