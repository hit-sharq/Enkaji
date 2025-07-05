"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WhatsAppButton() {
  const handleWhatsAppClick = () => {
    const phoneNumber = "+254700123456" // Replace with actual WhatsApp number
    const message = "Hello! I'm interested in learning more about Enkaji crafts."
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 shadow-lg z-50"
      size="icon"
    >
      <MessageCircle className="w-6 h-6" />
    </Button>
  )
}
