import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import FavoritesList from "@/components/favorites/favorites-list"

export const dynamic = 'force-dynamic'

export default async function FavoritesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Favorites</h1>
          <p className="text-muted-foreground">Products you've saved for later</p>
        </div>
        <FavoritesList userId={user.id} />
      </main>
    </div>
  )
}
