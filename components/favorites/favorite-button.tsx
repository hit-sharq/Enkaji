"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@clerk/nextjs"

interface FavoriteButtonProps {
  productId: string
  initialIsFavorite?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline" | "ghost" | "secondary"
  showText?: boolean
  className?: string
}

export function FavoriteButton({
  productId,
  initialIsFavorite = false,
  size = "md",
  variant = "ghost",
  showText = false,
  className,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isLoading, setIsLoading] = useState(false)
  const { isSignedIn } = useAuth()
  const { toast } = useToast()

  const handleToggleFavorite = async () => {
    if (!isSignedIn) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save items to your favorites.",
        variant: "default",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsFavorite(data.isFavorite)
        toast({
          title: data.isFavorite ? "Added to favorites" : "Removed from favorites",
          description: data.isFavorite
            ? "This item has been saved to your favorites."
            : "This item has been removed from your favorites.",
        })
      } else {
        throw new Error(data.error || "Failed to update favorites")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update favorites",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  return (
    <Button
      variant={variant}
      size="icon"
      className={`
        ${sizeClasses[size]}
        ${isFavorite ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-gray-600"}
        ${className || ""}
      `}
      onClick={handleToggleFavorite}
      disabled={isLoading}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {isLoading ? (
        <span className={`${iconSizes[size]} animate-spin`} />
      ) : (
        <Heart
          className={`${iconSizes[size]} ${isFavorite ? "fill-current" : ""}`}
        />
      )}
      {showText && (
        <span className="ml-2">
          {isFavorite ? "Saved" : "Save"}
        </span>
      )}
    </Button>
  )
}

