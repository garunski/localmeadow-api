/**
 * In-memory blog/CMS store.
 * 
 * TODO: This is being migrated to database-backed storage.
 * Use the BlogCmsService from the module container instead.
 * This file is kept for backward compatibility during migration.
 */
import type { BlogPost, CreatePostInput, UpdatePostInput } from './types'

const store = new Map<string, BlogPost>()

function now(): string {
  return new Date().toISOString()
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export const blogCmsService = {
  list(): BlogPost[] {
    return Array.from(store.values())
  },

  get(id: string): BlogPost | undefined {
    return store.get(id)
  },

  create(input: CreatePostInput): BlogPost {
    const id = `post_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const slug = input.slug ?? slugify(input.title)
    const post: BlogPost = {
      id,
      title: input.title,
      slug,
      body: input.body,
      excerpt: input.excerpt,
      status: input.status ?? 'draft',
      author_id: input.author_id,
      published_at: input.status === 'published' ? now() : undefined,
      created_at: now(),
      updated_at: now(),
    }
    store.set(id, post)
    return post
  },

  update(id: string, input: UpdatePostInput): BlogPost | undefined {
    const existing = store.get(id)
    if (!existing) return undefined
    const updated: BlogPost = {
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
