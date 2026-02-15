/**
 * Local Meadow - Farmers Market types
 * Persist via a custom Medusa module with migrations when ready.
 */
export interface FarmersMarket {
  id: string
  name: string
  description?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country_code?: string
  latitude?: number
  longitude?: number
  timezone?: string
  schedule_summary?: string
  created_at: string
  updated_at: string
}

export interface CreateMarketInput {
  name: string
  description?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country_code?: string
  timezone?: string
  schedule_summary?: string
}

export interface UpdateMarketInput extends Partial<CreateMarketInput> {}
