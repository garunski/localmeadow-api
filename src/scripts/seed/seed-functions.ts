import { MedusaContainer } from '@medusajs/framework'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createServiceZonesWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  updateStoresWorkflow,
  updateTaxRegionsWorkflow,
  createUserAccountWorkflow
} from '@medusajs/medusa/core-flows'

import { SELLER_MODULE } from '@mercurjs/b2c-core/modules/seller'
import {
  createConfigurationRuleWorkflow,
  createLocationFulfillmentSetAndAssociateWithSellerWorkflow,
  createSellerWorkflow
} from '@mercurjs/b2c-core/workflows'
import { createCommissionRuleWorkflow } from '@mercurjs/commission/workflows'
import {
  ConfigurationRuleDefaults,
  SELLER_SHIPPING_PROFILE_LINK
} from '@mercurjs/framework'

import { productsToInsert } from './seed-products'

const eurCountries = ['be', 'de', 'dk', 'se', 'fr', 'es', 'it', 'pl', 'cz', 'nl']
const usCountries = ['us']

export async function createAdminUser(container: MedusaContainer) {
  const authService = container.resolve(Modules.AUTH)
  const userService = container.resolve(Modules.USER)
  
  // Check if admin user already exists
  const [existingUser] = await userService.listUsers({
    email: 'admin@localmeadow.com'
  })
  
  if (existingUser) {
    return existingUser
  }
  
  // Create auth identity with password
  const { authIdentity } = await authService.register('emailpass', {
    body: {
      email: 'admin@localmeadow.com',
      password: 'admin123'
    }
  })
  
  if (!authIdentity?.id) {
    throw new Error('Failed to create admin auth identity')
  }
  
  // Create admin user account
  const { result: user } = await createUserAccountWorkflow(container).run({
    input: {
      userData: {
        email: 'admin@localmeadow.com',
        first_name: 'Admin',
        last_name: 'User'
      },
      authIdentityId: authIdentity.id
    }
  })
  
  return user
}

export async function createSalesChannel(container: MedusaContainer) {
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  let [defaultSalesChannel] = await salesChannelModuleService.listSalesChannels(
    {
      name: 'Default Sales Channel'
    }
  )

  if (!defaultSalesChannel) {
    const {
      result: [salesChannelResult]
    } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [
          {
            name: 'Default Sales Channel'
          }
        ]
      }
    })
    defaultSalesChannel = salesChannelResult
  }

  return defaultSalesChannel
}

export async function createStore(
  container: MedusaContainer,
  salesChannelId: string,
  regionId: string
) {
  const storeModuleService = container.resolve(Modules.STORE)
  const [store] = await storeModuleService.listStores()

  if (!store) {
    return
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: salesChannelId,
        default_region_id: regionId
      }
    }
  })
}
export async function createRegions(container: MedusaContainer) {
  const regionModuleService = container.resolve(Modules.REGION)
  
  // Check if regions already exist
  const existingRegions = await regionModuleService.listRegions()
  
  if (existingRegions.length > 0) {
    // Return US region if it exists, otherwise first region
    return existingRegions.find(r => r.name === 'United States') || existingRegions[0]
  }
  
  // Create both Europe and US regions
  const { result: regions } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: 'Europe',
          currency_code: 'eur',
          countries: eurCountries,
          payment_providers: ['pp_system_default']
        },
        {
          name: 'United States',
          currency_code: 'usd',
          countries: usCountries,
          payment_providers: ['pp_system_default']
        }
      ]
    }
  })

  // Create tax regions for all countries
  const allCountries = [...eurCountries, ...usCountries]
  const { result: taxRegions } = await createTaxRegionsWorkflow(container).run({
    input: allCountries.map((country_code) => ({
      country_code
    }))
  })

  await updateTaxRegionsWorkflow(container).run({
    input: taxRegions.map((taxRegion) => ({
      id: taxRegion.id,
      provider_id: 'tp_system'
    }))
  })

  // Return US region as default (for storefront default)
  return regions.find(r => r.name === 'United States') || regions[0]
}

export async function createPublishableKey(
  container: MedusaContainer,
  salesChannelId: string
) {
  const apiKeyService = container.resolve(Modules.API_KEY)

  let [key] = await apiKeyService.listApiKeys({ type: 'publishable' })

  if (!key) {
    const {
      result: [publishableApiKeyResult]
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: 'Default publishable key',
            type: 'publishable',
            created_by: ''
          }
        ]
      }
    })
    key = publishableApiKeyResult
  }

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: key.id,
      add: [salesChannelId]
    }
  })

  return key
}

export async function createProductCategories(container: MedusaContainer) {
  const productModuleService = container.resolve(Modules.PRODUCT)
  
  // Check if categories already exist
  const existingCategories = await productModuleService.listProductCategories()
  
  if (existingCategories.length > 0) {
    return existingCategories
  }
  
  const { result } = await createProductCategoriesWorkflow(container).run({
    input: {
      product_categories: [
        {
          name: 'Fresh Produce',
          is_active: true,
          description: 'Fresh fruits and vegetables from local farms'
        },
        {
          name: 'Dairy & Eggs',
          is_active: true,
          description: 'Fresh dairy products and farm eggs'
        },
        {
          name: 'Meat & Poultry',
          is_active: true,
          description: 'Locally raised meat and poultry'
        },
        {
          name: 'Baked Goods',
          is_active: true,
          description: 'Fresh bread, pastries, and baked items'
        },
        {
          name: 'Preserves & Honey',
          is_active: true,
          description: 'Jams, jellies, honey, and preserves'
        },
        {
          name: 'Beverages',
          is_active: true,
          description: 'Fresh juices, ciders, and local drinks'
        },
        {
          name: 'Prepared Foods',
          is_active: true,
          description: 'Ready-to-eat meals and prepared foods'
        },
        {
          name: 'Herbs & Spices',
          is_active: true,
          description: 'Fresh and dried herbs and spices'
        }
      ]
    }
  })

  return result
}

export async function createProductCollections(container: MedusaContainer) {
  const productModuleService = container.resolve(Modules.PRODUCT)
  
  // Check if collections already exist
  const existingCollections = await productModuleService.listProductCollections()
  
  if (existingCollections.length > 0) {
    return existingCollections
  }
  
  const { result } = await createCollectionsWorkflow(container).run({
    input: {
      collections: [
        {
          title: 'Organic',
          handle: 'organic'
        },
        {
          title: 'Seasonal Favorites',
          handle: 'seasonal'
        },
        {
          title: 'Farm Fresh',
          handle: 'farm-fresh'
        },
        {
          title: 'Artisan Made',
          handle: 'artisan'
        },
        {
          title: 'Weekend Specials',
          handle: 'weekend-specials'
        },
        {
          title: 'Best Sellers',
          handle: 'best-sellers'
        }
      ]
    }
  })

  return result
}

export async function createSeller(container: MedusaContainer) {
  const authService = container.resolve(Modules.AUTH)
  const sellerModule = container.resolve(SELLER_MODULE)
  
  // Check if seller already exists by handle
  const [existingSeller] = await sellerModule.listSellers({ 
    handle: 'green-valley-farm'
  })
  
  if (existingSeller) {
    return existingSeller
  }

  // Check if auth identity already exists
  let authIdentity
  try {
    const authResult = await authService.register('emailpass', {
      body: {
        email: 'contact@greenvalleyfarm.com',
        password: 'farm123'
      }
    })
    authIdentity = authResult.authIdentity
  } catch (error) {
    // If auth already exists, retrieve it
    const authIdentities = await authService.retrieve('contact@greenvalleyfarm.com')
    authIdentity = authIdentities
  }

  const { result: seller } = await createSellerWorkflow.run({
    container,
    input: {
      auth_identity_id: authIdentity?.id,
      member: {
        name: 'Sarah Johnson',
        email: 'contact@greenvalleyfarm.com'
      },
      seller: {
        name: 'Green Valley Farm',
        description: 'Family-owned organic farm specializing in fresh produce, artisan goods, and farm-fresh products. Serving the community since 1985.',
        email: 'contact@greenvalleyfarm.com',
        phone: '+1 (555) 123-4567'
      }
    }
  })

  return seller
}

export async function createSellerStockLocation(
  container: MedusaContainer,
  sellerId: string,
  salesChannelId: string
) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  
  // Check if stock location already exists for this seller
  const existingStock = await query.graph({
    entity: 'stock_location',
    fields: ['*', 'fulfillment_sets.*'],
    filters: {
      name: `Stock Location for seller ${sellerId}`
    }
  })
  
  if (existingStock.data.length > 0) {
    return existingStock.data[0]
  }
  
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const {
    result: [stock]
  } = await createStockLocationsWorkflow(container).run({
    input: {
      locations: [
        {
          name: `Stock Location for seller ${sellerId}`,
          address: {
            address_1: 'Random Strasse',
            city: 'Berlin',
            country_code: 'de'
          }
        }
      ]
    }
  })

  await link.create([
    {
      [SELLER_MODULE]: {
        seller_id: sellerId
      },
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stock.id
      }
    },
    {
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stock.id
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: 'manual_manual'
      }
    },
    {
      [Modules.SALES_CHANNEL]: {
        sales_channel_id: salesChannelId
      },
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stock.id
      }
    }
  ])

  await createLocationFulfillmentSetAndAssociateWithSellerWorkflow.run({
    container,
    input: {
      fulfillment_set_data: {
        name: `${sellerId} fulfillment set`,
        type: 'shipping'
      },
      location_id: stock.id,
      seller_id: sellerId
    }
  })

  const {
    data: [stockLocation]
  } = await query.graph({
    entity: 'stock_location',
    fields: ['*', 'fulfillment_sets.*'],
    filters: {
      id: stock.id
    }
  })

  return stockLocation
}

export async function createServiceZoneForFulfillmentSet(
  container: MedusaContainer,
  sellerId: string,
  fulfillmentSetId: string
) {
  const fulfillmentService = container.resolve(Modules.FULFILLMENT)
  
  // Check if service zone already exists for this fulfillment set
  const existingZones = await fulfillmentService.listServiceZones({
    fulfillment_set: {
      id: fulfillmentSetId
    }
  })
  
  if (existingZones.length > 0) {
    // Link existing zone to seller if not already linked
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    try {
      await link.create({
        [SELLER_MODULE]: {
          seller_id: sellerId
        },
        [Modules.FULFILLMENT]: {
          service_zone_id: existingZones[0].id
        }
      })
    } catch (error) {
      // Link might already exist, ignore
    }
    return existingZones[0]
  }
  
  const allCountries = [...eurCountries, ...usCountries]
  
  await createServiceZonesWorkflow.run({
    container,
    input: {
      data: [
        {
          fulfillment_set_id: fulfillmentSetId,
          name: `Service Zone ${sellerId}`,
          geo_zones: allCountries.map((c) => ({
            type: 'country',
            country_code: c
          }))
        }
      ]
    }
  })

  const [zone] = await fulfillmentService.listServiceZones({
    fulfillment_set: {
      id: fulfillmentSetId
    }
  })

  const link = container.resolve(ContainerRegistrationKeys.LINK)
  await link.create({
    [SELLER_MODULE]: {
      seller_id: sellerId
    },
    [Modules.FULFILLMENT]: {
      service_zone_id: zone.id
    }
  })

  return zone
}

export async function createSellerShippingOption(
  container: MedusaContainer,
  sellerId: string,
  sellerName: string,
  regionId: string,
  serviceZoneId: string
) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [shippingProfile]
  } = await query.graph({
    entity: SELLER_SHIPPING_PROFILE_LINK,
    fields: ['shipping_profile_id'],
    filters: {
      seller_id: sellerId
    }
  })

  const {
    result: [shippingOption]
  } = await createShippingOptionsWorkflow.run({
    container,
    input: [
      {
        name: `${sellerName} shipping`,
        shipping_profile_id: shippingProfile.shipping_profile_id,
        service_zone_id: serviceZoneId,
        provider_id: 'manual_manual',
        type: {
          label: `${sellerName} shipping`,
          code: sellerName,
          description: 'Europe shipping'
        },
        rules: [
          { value: 'true', attribute: 'enabled_in_store', operator: 'eq' },
          { attribute: 'is_return', value: 'false', operator: 'eq' }
        ],
        prices: [
          { currency_code: 'eur', amount: 10 },
          { amount: 10, region_id: regionId }
        ],
        price_type: 'flat',
        data: { id: 'manual-fulfillment' }
      }
    ]
  })

  const link = container.resolve(ContainerRegistrationKeys.LINK)
  await link.create({
    [SELLER_MODULE]: {
      seller_id: sellerId
    },
    [Modules.FULFILLMENT]: {
      shipping_option_id: shippingOption.id
    }
  })

  return shippingOption
}

export async function createSellerProducts(
  container: MedusaContainer,
  sellerId: string,
  salesChannelId: string
) {
  const productService = container.resolve(Modules.PRODUCT)
  
  // Check if products already exist for this seller
  const existingProducts = await productService.listProducts({}, { take: 1 })
  
  if (existingProducts.length > 0) {
    // Products already exist, skip creation
    return existingProducts
  }
  
  const collections = await productService.listProductCollections(
    {},
    { select: ['id', 'title'] }
  )
  const categories = await productService.listProductCategories(
    {},
    { select: ['id', 'name'] }
  )

  const randomCategory = () =>
    categories[Math.floor(Math.random() * categories.length)]
  const randomCollection = () =>
    collections[Math.floor(Math.random() * collections.length)]

  const toInsert = productsToInsert.map((p) => ({
    ...p,
    categories: [
      {
        id: randomCategory().id
      }
    ],
    collection_id: randomCollection().id,
    sales_channels: [
      {
        id: salesChannelId
      }
    ]
  }))

  const { result } = await createProductsWorkflow.run({
    container,
    input: {
      products: toInsert,
      additional_data: {
        seller_id: sellerId
      }
    }
  })

  return result
}

export async function createInventoryItemStockLevels(
  container: MedusaContainer,
  stockLocationId: string
) {
  const inventoryService = container.resolve(Modules.INVENTORY)
  
  // Check if inventory levels already exist for this location
  const existingLevels = await inventoryService.listInventoryLevels({
    location_id: stockLocationId
  })
  
  if (existingLevels.length > 0) {
    return existingLevels
  }
  
  const items = await inventoryService.listInventoryItems(
    {},
    { select: ['id'] }
  )

  const toCreate = items.map((i) => ({
    inventory_item_id: i.id,
    location_id: stockLocationId,
    stocked_quantity: Math.floor(Math.random() * 50) + 1
  }))

  const { result } = await createInventoryLevelsWorkflow.run({
    container,
    input: {
      inventory_levels: toCreate
    }
  })
  return result
}

export async function createDefaultCommissionLevel(container: MedusaContainer) {
  try {
    await createCommissionRuleWorkflow.run({
      container,
      input: {
        name: 'default',
        is_active: true,
        reference: 'site',
        reference_id: '',
        rate: {
          include_tax: true,
          type: 'percentage',
          percentage_rate: 2
        }
      }
    })
  } catch (error) {
    // Rule already exists, skip
    if (error.message?.includes('Rule already exists')) {
      return
    }
    throw error
  }
}

export async function createConfigurationRules(container: MedusaContainer) {
  try {
    const configModule = container.resolve('configurationModuleService')
    
    for (const [ruleType, isEnabled] of ConfigurationRuleDefaults) {
      // Check if rule already exists
      const existingRules = await configModule.listConfigurationRules({ 
        rule_type: ruleType 
      })
      
      if (existingRules.length > 0) {
        continue // Skip if already exists
      }
      
      await createConfigurationRuleWorkflow.run({
        container,
        input: {
          rule_type: ruleType,
          is_enabled: isEnabled
        }
      })
    }
  } catch (error) {
    // If configuration module doesn't exist or rules already exist, skip
    console.log('Skipping configuration rules:', error.message)
  }
}

export async function createCustomers(container: MedusaContainer) {
  const customerModule = container.resolve(Modules.CUSTOMER)
  
  const sampleCustomers = [
    {
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+1234567890'
    },
    {
      email: 'jane.smith@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      phone: '+1234567891'
    },
    {
      email: 'bob.wilson@example.com',
      first_name: 'Bob',
      last_name: 'Wilson',
      phone: '+1234567892'
    },
    {
      email: 'alice.brown@example.com',
      first_name: 'Alice',
      last_name: 'Brown',
      phone: '+1234567893'
    },
    {
      email: 'charlie.davis@example.com',
      first_name: 'Charlie',
      last_name: 'Davis',
      phone: '+1234567894'
    }
  ]

  for (const customerData of sampleCustomers) {
    // Check if customer already exists
    const [existingCustomer] = await customerModule.listCustomers({
      email: customerData.email
    })
    
    if (existingCustomer) {
      continue
    }

    await customerModule.createCustomers(customerData)
  }
}
