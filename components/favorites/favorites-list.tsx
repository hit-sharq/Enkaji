import { db } from "@/lib/db"
import { ProductCard } from "@/components/products/product-card"
import { Heart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface FavoritesListProps {
  userId: string
}

export default async function FavoritesList({ userId }: FavoritesListProps) {
  const favorites = await db.favorite.findMany({
    where: {
      userId: userId,
    },
    include: {
      product: {
        include: {
          category: true,
          seller: {
            select: { firstName: true, lastName: true, imageUrl: true },
          },
          _count: { select: { reviews: true } },
        },
      },
    },
  })

  if (favorites.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card py-16 text-center shadow-card">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-enkaji-orange/10">
            <Heart className="h-8 w-8 text-enkaji-orange" />
          </div>
          <h2 className="font-display text-lg font-semibold mb-2">No favorites yet</h2>
          <p className="text-muted-foreground mb-6">
            Tap the heart on any product to save it here for later.
          </p>
          <Button asChild>
            <Link href="/shop">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {favorites.map((favorite) => (
        <ProductCard
          key={favorite.id}
          product={{
            id: favorite.product.id,
            name: favorite.product.name,
            description: favorite.product.description,
            price: favorite.product.price.toNumber(),
            images: favorite.product.images,
            category: { id: favorite.product.category.id, name: favorite.product.category.name },
            seller: {
              firstName: favorite.product.seller.firstName || "",
              lastName: favorite.product.seller.lastName || "",
              imageUrl: favorite.product.seller.imageUrl,
            },
            _count: { reviews: favorite.product._count.reviews },
          }}
        />
      ))}
    </div>
  )
}
