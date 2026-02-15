import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse
} from '@medusajs/framework'
import { defineMiddlewares } from '@medusajs/medusa'
import { parseCorsOrigins } from '@medusajs/framework/utils'
import * as domainStore from '../plugins/custom-domains/domain-store'

function getAllowedOrigins(): string[] {
  const fromEnv = [
    ...parseCorsOrigins(process.env.STORE_CORS || ''),
    ...parseCorsOrigins(process.env.VENDOR_CORS || '')
  ].filter(Boolean)
  const customDomains = domainStore.getAllDomains()
  const fromCustom = customDomains.flatMap((d) => [
    `https://${d}`,
    `http://${d}`
  ])
  // Combine all origins and remove duplicates, filtering out RegExp
  return [...new Set([...fromEnv, ...fromCustom])].filter((origin): origin is string => typeof origin === 'string')
}

function dynamicCors(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
): void {
  const origin = req.get('Origin')
  const allowed = getAllowedOrigins()
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    )
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept'
    )
  }
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  next()
}

function storeContextByDomain(
  req: MedusaRequest,
  _res: MedusaResponse,
  next: MedusaNextFunction
): void {
  const host = req.get('Host')?.split(':')[0] ?? ''
  const sellerId = domainStore.getSellerIdByDomain(host)
  if (sellerId) {
    ;(req as MedusaRequest & { customSellerId?: string }).customSellerId =
      sellerId
  }
  next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: /^\/store\/.*/,
      middlewares: [dynamicCors, storeContextByDomain]
    },
    {
      matcher: /^\/vendor\/.*/,
      middlewares: [dynamicCors]
    }
  ]
})
