import { CartItems } from "@/components/cart/cart-items"
import { CartSummary } from "@/components/cart/cart-summary"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"

export default function CartPage() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-16">
        <p className="enkaji-eyebrow mb-3">Your Selection</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-10">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartItems />
          </div>
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      </main>
      <WhatsAppButton />
    </div>
  )
}
