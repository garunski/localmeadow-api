import { Module } from '@medusajs/framework/utils'
import schemaSyncLoader from './loaders/schema-sync'

export default Module('schema-sync', {
  loaders: [schemaSyncLoader]
})
