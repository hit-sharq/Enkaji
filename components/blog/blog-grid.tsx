import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  imageUrl: string | null
  createdAt: Date
}

interface BlogGridProps {
  posts: BlogPost[]
}

export function BlogGrid({ posts }: BlogGridProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-foreground mb-2">No blog posts yet</h3>
        <p className="text-muted-foreground">Check back soon for stories from our artisans!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <Link key={post.id} href={`/blog/${post.slug}`}>
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <div className="aspect-video relative overflow-hidden rounded-t-lg">
              <Image src={post.imageUrl || "/placeholder.jpg"} alt={post.title} fill className="object-cover" />
            </div>
            <CardContent className="p-6">
              <div className="mb-3">
                <Badge variant="secondary" className="text-xs">
                  {new Date(post.createdAt).toLocaleDateString()}
                </Badge>
              </div>
              <h3 className="font-playfair text-xl font-bold text-foreground mb-3 line-clamp-2">{post.title}</h3>
              {post.excerpt && <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
