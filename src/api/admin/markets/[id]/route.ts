import type { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { farmersMarketService } from '../../../../plugins/farmers-markets/service'

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const market = farmersMarketService.get(id)
  if (!market) {
    res.status(404).json({ message: 'Market not found' })
    return
  }
  res.json({ market })
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body ?? {}) as Record<string, unknown>
  const market = farmersMarketService.update(id, {
    name: body.name != null ? String(body.name) : undefined,
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
  if (!market) {
    res.status(404).json({ message: 'Market not found' })
    return
  }
  res.json({ market })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const deleted = farmersMarketService.delete(id)
  if (!deleted) {
    res.status(404).json({ message: 'Market not found' })
    return
  }
  res.status(204).send()
}
