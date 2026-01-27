import { WhatsAppButton } from "@/components/ui/whatsapp-button"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                We collect information you provide directly to us, such as when you create an account, make a purchase,
                or contact us. This may include your name, email address, phone number, shipping address, and payment
                information.
              </p>
              <p className="text-gray-700">
                We also automatically collect certain information about your device and how you interact with our
                website, including your IP address, browser type, and pages visited.
              </p>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and account</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your
                consent, except as described in this policy. We may share your information with:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Service providers who help us operate our business</li>
                <li>Payment processors to handle transactions</li>
                <li>Shipping companies to deliver your orders</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-700">
                We implement appropriate security measures to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction. However, no method of transmission over the internet is
                100% secure.
              </p>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Access and update your personal information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt out of marketing communications</li>
                <li>Request a copy of your personal information</li>
              </ul>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us at privacy@enkaji.com or through
                our contact page.
              </p>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the
                new policy on this page and updating the "Last Updated" date.
              </p>
              <p className="text-sm text-gray-500 mt-4">Last Updated: January 2024</p>
            </section>
          </div>
        </div>
      </main>
      <WhatsAppButton />
    </div>
  )
}
