/**
 * In-memory store for custom domain → seller_id mapping.
 * Replace with DB (e.g. seller_domain table) for persistence.
 */
const domainToSeller = new Map<string, string>()

export function addDomain(domain: string, sellerId: string): void {
  const normalized = domain.toLowerCase().trim().replace(/^https?:\/\//, '').split('/')[0]
  domainToSeller.set(normalized, sellerId)
}

export function removeDomain(domain: string): boolean {
  const normalized = domain.toLowerCase().trim().replace(/^https?:\/\//, '').split('/')[0]
  return domainToSeller.delete(normalized)
}

export function getSellerIdByDomain(domain: string): string | undefined {
  const normalized = domain.toLowerCase().trim().replace(/^https?:\/\//, '').split('/')[0]
  return domainToSeller.get(normalized)
}

export function getAllDomains(): string[] {
  return Array.from(domainToSeller.keys())
}

export function listDomainRecords(): Array<{ domain: string; seller_id: string }> {
  return Array.from(domainToSeller.entries()).map(([domain, seller_id]) => ({
    domain,
    seller_id
  }))
}
