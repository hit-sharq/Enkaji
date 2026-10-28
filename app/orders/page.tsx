export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { OrdersList } from "@/components/orders/orders-list"

export default async function OrdersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <span className="enkaji-eyebrow mb-2 block">Account</span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track your order history and status</p>
        </div>
        <OrdersList userId={user.id} />
      </main>
    </div>
  )
}
