import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { SellerRegistrationForm } from "@/components/seller/seller-registration-form"

export default async function SellPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Start Selling on Enkaji Trade Kenya</h1>
            <p className="text-gray-600">
              Join thousands of successful sellers across Kenya. Set up your seller profile and start listing your
              products today.
            </p>
          </div>
          <SellerRegistrationForm
            user={{
              id: user.id,
              email: user.email,
              firstName: user.firstName ?? null,
              lastName: user.lastName ?? null,
            }}
          />
        </div>
      </main>
    </div>
  )
}
