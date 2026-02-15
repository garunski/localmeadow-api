/**
 * Local Meadow - Analytics types (ClickHouse integration)
 */
export interface AnalyticsSummary {
  period: string
  total_revenue: number
  total_orders: number
  total_customers: number
  top_products: { id: string; title: string; quantity: number }[]
}

export interface AnalyticsQueryParams {
  from?: string
  to?: string
  vendor_id?: string
}
