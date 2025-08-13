import { notFound } from "next/navigation"
import Image from "next/image"
import { prisma } from "@/lib/db"

interface BlogPostData {
  id: string
  title: string
  content: string
  featuredImage: string | null
  publishedAt: Date | null
  createdAt: Date
  author: {
    firstName: string | null
    lastName: string | null
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({
    where: { 
      slug: params.slug,
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
  })

  if (!post) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        
        {post.featuredImage && (
          <div className="relative w-full h-64 md:h-96 mb-8">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )}
        
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
        
        <div className="mt-8 text-sm text-gray-600">
          <p>Published on {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</p>
          <p>By {post.author.firstName} {post.author.lastName}</p>
        </div>
      </article>
    </div>
  )
}
