import { prisma } from "@/lib/db"
import { BlogGrid } from "@/components/blog/blog-grid"
import type { BlogPost } from "@/lib/types"

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      author: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { publishedAt: "desc" },
  })

  // Convert to match BlogPost interface
  const blogPosts: BlogPost[] = posts.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    imageUrl: post.featuredImage,
    createdAt: post.createdAt,
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <BlogGrid posts={blogPosts} />
    </div>
  )
}
