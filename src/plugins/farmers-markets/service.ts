/**
 * In-memory farmers market store.
 * Replace with a Medusa module + PostgreSQL once migrations are added.
 */
import type { FarmersMarket, CreateMarketInput, UpdateMarketInput } from './types'

const store = new Map<string, FarmersMarket>()

function now(): string {
  return new Date().toISOString()
}

export const farmersMarketService = {
  list(): FarmersMarket[] {
    return Array.from(store.values())
  },

  get(id: string): FarmersMarket | undefined {
    return store.get(id)
  },

  create(input: CreateMarketInput): FarmersMarket {
    const id = `market_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const market: FarmersMarket = {
      id,
      name: input.name,
      description: input.description,
      address: input.address,
      city: input.city,
      state: input.state,
      postal_code: input.postal_code,
      country_code: input.country_code ?? 'US',
      timezone: input.timezone,
      schedule_summary: input.schedule_summary,
      created_at: now(),
      updated_at: now(),
    }
    store.set(id, market)
    return market
  },

  update(id: string, input: UpdateMarketInput): FarmersMarket | undefined {
    const existing = store.get(id)
    if (!existing) return undefined
    const updated: FarmersMarket = {
      ...existing,
      ...input,
      id,
      updated_at: now(),
    }
    store.set(id, updated)
    return updated
  },

  delete(id: string): boolean {
    return store.delete(id)
  },
}
