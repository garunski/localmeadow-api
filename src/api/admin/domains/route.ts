import type { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import * as domainStore from '../../../plugins/custom-domains/domain-store'

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const records = domainStore.listDomainRecords()
  res.json({ domains: records })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as { domain?: string; seller_id?: string }
  const domain = typeof body?.domain === 'string' ? body.domain.trim() : ''
  const sellerId = typeof body?.seller_id === 'string' ? body.seller_id.trim() : ''
  if (!domain || !sellerId) {
    res.status(400).json({
      message: 'Missing or invalid domain or seller_id'
    })
    return
  }
  domainStore.addDomain(domain, sellerId)
  res.status(201).json({
    domain: domain.toLowerCase().replace(/^https?:\/\//, '').split('/')[0],
    seller_id: sellerId
  })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const domain = typeof req.query?.domain === 'string' ? req.query.domain.trim() : ''
  if (!domain) {
    res.status(400).json({ message: 'Missing query parameter: domain' })
    return
  }
  const removed = domainStore.removeDomain(domain)
  if (!removed) {
    res.status(404).json({ message: 'Domain not found' })
    return
  }
  res.status(204).send()
}
