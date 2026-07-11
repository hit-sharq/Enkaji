import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { FAQSection } from "@/components/faq/faq-section"

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="enkaji-eyebrow mb-3">Support</p>
            <h1 className="font-playfair font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about Enkaji, our products, and services
            </p>
          </div>

          <FAQSection />
        </div>
      </main>
      <WhatsAppButton />
    </div>
  )
}
