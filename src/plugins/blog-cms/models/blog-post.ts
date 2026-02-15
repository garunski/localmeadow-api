import { model } from '@medusajs/framework/utils'

/**
 * Blog Post Entity
 * 
 * Represents a blog post or CMS content item.
 * This model is automatically synced to the database by the schema-sync module.
 */
const BlogPost = model.define('blog_post', {
  id: model.id().primaryKey(),
  title: model.text(),
  slug: model.text().unique(),
  body: model.text().nullable(),
  excerpt: model.text().nullable(),
  status: model.enum(['draft', 'published', 'archived']).default('draft'),
  author_id: model.text().nullable(),
  published_at: model.dateTime().nullable(),
  created_at: model.dateTime().default('now'),
  updated_at: model.dateTime().default('now').onUpdate('now')
})

export default BlogPost
