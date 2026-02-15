import { Module } from '@medusajs/framework/utils'
import CustomDomain from './models/custom-domain'

export default Module('custom-domains', {
  definition: {
    models: [CustomDomain]
  }
})
