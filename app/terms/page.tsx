import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using the Enkaji website and services, you accept and agree to be bound by the terms
                and provision of this agreement. If you do not agree to abide by the above, please do not use this
                service.
              </p>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">Use License</h2>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily download one copy of the materials on Enkaji's website for
                personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of
                title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">Product Information</h2>
              <p className="text-gray-700">
                All products sold on Enkaji are handmade by Masai artisans. Due to the handmade nature, slight
                variations in color, size, and design are normal and should be expected. We strive to display colors and
                details as accurately as possible, but cannot guarantee that your device's display will accurately
                reflect the actual product colors.
              </p>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">Pricing and Payment</h2>
              <p className="text-gray-700">
                All prices are listed in USD unless otherwise specified. We reserve the right to change prices at any
                time without notice. Payment is required at the time of purchase. We accept major credit cards and
                M-Pesa for Kenyan customers.
              </p>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">Shipping and Delivery</h2>
              <p className="text-gray-700">
                We ship worldwide. Shipping costs and delivery times vary by location and shipping method selected. We
                are not responsible for delays caused by customs, weather, or other factors beyond our control.
              </p>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">Returns and Refunds</h2>
              <p className="text-gray-700">
                We offer a 30-day return policy for unused items in their original condition. Custom orders and
                personalized items cannot be returned unless defective. Return shipping costs are the responsibility of
                the customer unless the item was defective or incorrectly shipped.
              </p>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700">
                In no event shall Enkaji or its suppliers be liable for any damages (including, without limitation,
                damages for loss of data or profit, or due to business interruption) arising out of the use or inability
                to use the materials on Enkaji's website.
              </p>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms of Service, please contact us at legal@enkaji.com or through
                our contact page.
              </p>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
              <p className="text-gray-700">
                Enkaji reserves the right to revise these terms of service at any time without notice. By using this
                website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
              <p className="text-sm text-gray-500 mt-4">Last Updated: January 2024</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
