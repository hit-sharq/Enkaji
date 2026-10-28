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
      <div className="rounded-2xl border border-border bg-card py-16 text-center shadow-card">
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">No blog posts yet</h3>
        <p className="text-muted-foreground">Check back soon for stories from our artisans!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <Link key={post.id} href={`/blog/${post.slug}`}>
          <Card className="group h-full overflow-hidden rounded-2xl border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated cursor-pointer">
            <div className="aspect-video relative overflow-hidden">
              <Image
                src={post.imageUrl || "/placeholder.jpg"}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <CardContent className="p-6">
              <div className="mb-3">
                <Badge className="rounded-full border border-enkaji-orange/20 bg-enkaji-orange/10 text-xs text-enkaji-orange">
                  {new Date(post.createdAt).toLocaleDateString()}
                </Badge>
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3 line-clamp-2 transition-colors group-hover:text-enkaji-orange">{post.title}</h3>
              {post.excerpt && <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
