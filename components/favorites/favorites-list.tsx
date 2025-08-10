import { db } from "@/lib/db"
import { ProductCard } from "@/components/products/product-card"

export default async function FavoritesList() {
  // In a real app, use the current user id (auth). For now, fetch a sample.
  const favorites = await db.favorite.findMany({
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
    take: 24,
  })

  if (favorites.length === 0) {
    return <p className="text-gray-600">You have no favorites yet.</p>
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
            price: favorite.product.price,
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
