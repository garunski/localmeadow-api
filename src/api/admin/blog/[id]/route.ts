import type { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { blogCmsService } from '../../../../plugins/blog-cms/service'

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const post = blogCmsService.get(id)
  if (!post) {
    res.status(404).json({ message: 'Post not found' })
    return
  }
  res.json({ post })
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body ?? {}) as Record<string, unknown>
  const post = blogCmsService.update(id, {
    title: body.title != null ? String(body.title) : undefined,
    slug: body.slug != null ? String(body.slug) : undefined,
    body: body.body != null ? String(body.body) : undefined,
    excerpt: body.excerpt != null ? String(body.excerpt) : undefined,
    status:
      body.status != null
        ? (body.status as 'draft' | 'published' | 'archived')
        : undefined,
    author_id: body.author_id != null ? String(body.author_id) : undefined,
  })
  if (!post) {
    res.status(404).json({ message: 'Post not found' })
    return
  }
  res.json({ post })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const deleted = blogCmsService.delete(id)
  if (!deleted) {
    res.status(404).json({ message: 'Post not found' })
    return
  }
  res.status(204).send()
}
