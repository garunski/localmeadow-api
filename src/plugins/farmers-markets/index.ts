import { Module } from '@medusajs/framework/utils'
import FarmersMarket from './models/farmers-market'

export default Module('farmers-markets', {
  definition: {
    models: [FarmersMarket]
  }
})
