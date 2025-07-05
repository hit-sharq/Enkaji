import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { BlogGrid } from "@/components/blog/blog-grid"
import { db } from "@/lib/db"

async function getBlogPosts() {
  return await db.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 12,
  })
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-4">Stories from Our Artisans</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the rich culture, traditions, and stories behind every handmade piece
          </p>
        </div>

        <BlogGrid posts={posts} />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
