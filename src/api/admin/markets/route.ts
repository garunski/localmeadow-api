import type { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { farmersMarketService } from '../../../plugins/farmers-markets/service'

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const markets = farmersMarketService.list()
  res.json({ markets })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as Record<string, unknown>
  const market = farmersMarketService.create({
    name: String(body.name ?? ''),
    description: body.description != null ? String(body.description) : undefined,
    address: body.address != null ? String(body.address) : undefined,
    city: body.city != null ? String(body.city) : undefined,
    state: body.state != null ? String(body.state) : undefined,
    postal_code: body.postal_code != null ? String(body.postal_code) : undefined,
    country_code: body.country_code != null ? String(body.country_code) : undefined,
    timezone: body.timezone != null ? String(body.timezone) : undefined,
    schedule_summary:
      body.schedule_summary != null ? String(body.schedule_summary) : undefined,
  })
  res.status(201).json({ market })
}
