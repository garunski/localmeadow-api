/**
 * Analytics service stub.
 * Replace with ClickHouse client and real queries when CLICKHOUSE_* env is set.
 * Example: use @clickhouse/client and run SQL for orders, revenue, etc.
 */
import type { AnalyticsSummary, AnalyticsQueryParams } from './types'

export const advancedAnalyticsService = {
  async getSummary(_params: AnalyticsQueryParams): Promise<AnalyticsSummary> {
    // TODO: Connect to ClickHouse when CLICKHOUSE_HOST etc. are configured
    // const client = createClient({ host: process.env.CLICKHOUSE_HOST, ... })
    // const rows = await client.query({ query: 'SELECT ...' })
    return {
      period: '30d',
      total_revenue: 0,
      total_orders: 0,
      total_customers: 0,
      top_products: [],
    }
  },
}
