import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { OrderDetails } from "@/components/orders/order-details"

interface OrderDetailsPageProps {
  params: {
    id: string
  }
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <OrderDetails orderId={params.id} userId={user.id} />
      </main>
      <Footer />
    </div>
  )
}
