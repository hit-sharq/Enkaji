import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Image from "next/image"

async function getBlogPost(slug: string) {
  return await db.blogPost.findUnique({
    where: { slug, published: true },
  })
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">
              {new Date(post.createdAt).toLocaleDateString()}
            </Badge>
            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>
            {post.excerpt && <p className="text-xl text-gray-600 mb-8">{post.excerpt}</p>}
          </div>

          {post.imageUrl && (
            <div className="aspect-video relative overflow-hidden rounded-lg mb-8">
              <Image src={post.imageUrl || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </article>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
