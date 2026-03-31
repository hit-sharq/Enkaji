import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { PaymentSettingsForm } from "@/components/seller/payment-settings-form"

export default async function PaymentSettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  if (user.role !== "SELLER") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Payment Settings</h1>
          <p className="text-gray-600 mb-8">
            Manage your payout methods. These details will be used when processing your payouts.
          </p>
          <PaymentSettingsForm
            user={{
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
            }}
            sellerProfile={user.sellerProfile}
          />
        </div>
      </main>
    </div>
  )
}
