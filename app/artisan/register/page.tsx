import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ArtisanRegistrationForm } from "@/components/artisan/artisan-registration-form"

export default async function ArtisanRegisterPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Sellers are the creators in this schema
  if (user.role === "SELLER") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Become an Artisan</h1>
            <p className="text-gray-600">
              Join our community of skilled Masai artisans and share your authentic crafts with the world.
            </p>
          </div>
          <ArtisanRegistrationForm
            user={{
              id: user.id,
              email: user.email,
              firstName: user.firstName ?? null,
              lastName: user.lastName ?? null,
            }}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
