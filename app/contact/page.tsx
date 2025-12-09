import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { ContactForm } from "@/components/contact/contact-form"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions about our products or want to learn more about our businesses? We'd love to hear from you!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>

              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Mail className="w-6 h-6 text-red-800 mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Email</h3>
                        <p className="text-gray-600">hello@enkaji.com</p>
                        <p className="text-gray-600">support@enkaji.com</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Phone className="w-6 h-6 text-red-800 mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Phone</h3>
                        <p className="text-gray-600">+254 794 773 456</p>
                        <p className="text-sm text-gray-500">Monday - Friday, 9AM - 6PM EAT</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <MapPin className="w-6 h-6 text-red-800 mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Address</h3>
                        <p className="text-gray-600">
                          Enkaji Marketplace
                          <br />
                          Nairobi, Kenya
                          <br />
                          East Africa
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <MessageCircle className="w-6 h-6 text-red-800 mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">WhatsApp</h3>
                        <p className="text-gray-600">+254 792 687 584</p>
                        <p className="text-sm text-gray-500">Quick support via WhatsApp</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* FAQ Link */}
              <div className="mt-8 p-6 bg-red-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Frequently Asked Questions</h3>
                <p className="text-gray-600 mb-4">
                  Find quick answers to common questions about orders, shipping, and our artisans.
                </p>
                <a href="/faq" className="text-red-800 font-medium hover:text-red-900 transition-colors">
                  Visit our FAQ →
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
