import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Store } from "lucide-react"
import Link from "next/link"

export default function SellerNotFound() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h1 className="font-playfair text-2xl font-bold text-gray-900 mb-4">Seller Not Found</h1>
          <p className="text-gray-600 mb-8">The seller you're looking for doesn't exist or may have been removed.</p>
          <Link href="/sellers">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sellers
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
