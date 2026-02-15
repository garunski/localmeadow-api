/**
 * Local Meadow - Blog/CMS types
 * Add a Medusa module + migrations for persistence when ready.
 */
export interface BlogPost {
  id: string
  title: string
  slug: string
  body?: string
  excerpt?: string
  status: 'draft' | 'published' | 'archived'
  author_id?: string
  published_at?: string
  created_at: string
  updated_at: string
}

export interface CreatePostInput {
  title: string
  slug?: string
  body?: string
  excerpt?: string
  status?: 'draft' | 'published' | 'archived'
  author_id?: string
}

export interface UpdatePostInput extends Partial<CreatePostInput> {}
