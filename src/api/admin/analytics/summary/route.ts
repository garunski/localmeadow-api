import type { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { advancedAnalyticsService } from '../../../../plugins/advanced-analytics/service'

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const from = req.query.from as string | undefined
  const to = req.query.to as string | undefined
  const vendor_id = req.query.vendor_id as string | undefined
  const summary = await advancedAnalyticsService.getSummary({ from, to, vendor_id })
  res.json(summary)
}
