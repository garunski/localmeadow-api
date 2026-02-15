import type { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { blogCmsService } from '../../../plugins/blog-cms/service'

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const posts = blogCmsService.list()
  res.json({ posts })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as Record<string, unknown>
  const post = blogCmsService.create({
    title: String(body.title ?? ''),
    slug: body.slug != null ? String(body.slug) : undefined,
    body: body.body != null ? String(body.body) : undefined,
    excerpt: body.excerpt != null ? String(body.excerpt) : undefined,
    status:
      body.status != null
        ? (body.status as 'draft' | 'published' | 'archived')
        : undefined,
    author_id: body.author_id != null ? String(body.author_id) : undefined,
  })
  res.status(201).json({ post })
}
