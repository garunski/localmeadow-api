import { model } from '@medusajs/framework/utils'

/**
 * Farmers Market Entity
 * 
 * Represents a physical farmers market location where vendors can sell products.
 * This model is automatically synced to the database by the schema-sync module.
 */
const FarmersMarket = model.define('farmers_market', {
  id: model.id().primaryKey(),
  name: model.text(),
  description: model.text().nullable(),
  address: model.text().nullable(),
  city: model.text().nullable(),
  state: model.text().nullable(),
  postal_code: model.text().nullable(),
  country_code: model.text().default('US'),
  latitude: model.number().nullable(),
  longitude: model.number().nullable(),
  timezone: model.text().nullable(),
  schedule_summary: model.text().nullable(),
  created_at: model.dateTime().default('now'),
  updated_at: model.dateTime().default('now').onUpdate('now')
})

export default FarmersMarket
