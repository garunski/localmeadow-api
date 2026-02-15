import { Module } from '@medusajs/framework/utils'
import BlogPost from './models/blog-post'

export default Module('blog-cms', {
  definition: {
    models: [BlogPost]
  }
})
