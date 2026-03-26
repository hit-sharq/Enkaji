"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTransition } from "react"

interface AddToCartButtonProps {
  productId: string
  productName: string
}

export function AddToCartButton({ productId, productName }: AddToCartButtonProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const handleAddToCart = () => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            productId, 
            quantity: 1 
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to add to cart')
        }

        toast({
          title: "Added to cart",
          description: `${productName} has been added to your cart`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add item to cart",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <Button 
      onClick={handleAddToCart}
      disabled={isPending}
      className="flex items-center gap-2"
      size="sm"
    >
      {isPending ? (
        <Plus className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </>
      )}
    </Button>
  )
}
