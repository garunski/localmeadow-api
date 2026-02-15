import type { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import * as domainStore from '../../../../plugins/custom-domains/domain-store'
import * as dns from 'node:dns'
import { promisify } from 'node:util'

const resolveCname = promisify(dns.resolveCname)

/**
 * GET /admin/domains/verify?domain=farmerjack.com
 * Returns DNS instructions and whether the domain currently points to the backend.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const domain = typeof req.query?.domain === 'string' ? req.query.domain.trim() : ''
  if (!domain) {
    res.status(400).json({ message: 'Missing query parameter: domain' })
    return
  }

  const backendHost = process.env.BACKEND_URL
    ? new URL(process.env.BACKEND_URL).hostname
    : process.env.BACKEND_HOST || 'api.yourmainsite.com'

  const instructions = {
    domain,
    cname_target: backendHost,
    steps: [
      `Add a CNAME record: ${domain} → ${backendHost}`,
      'If using apex (root) domain, some DNS providers require ALIAS/ANAME; otherwise use www and redirect root to www.',
      'Propagation usually takes 5–30 minutes.'
    ]
  }

  let verified = false
  let cnameValues: string[] = []
  try {
    cnameValues = await resolveCname(domain)
    verified = cnameValues.some((c) => c.endsWith(backendHost) || c === backendHost)
  } catch {
    // NXDOMAIN or not a CNAME
  }

  const sellerId = domainStore.getSellerIdByDomain(domain)
  res.json({
    ...instructions,
    verified,
    cname_values: cnameValues,
    seller_id: sellerId ?? null
  })
}
