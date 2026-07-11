import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { ContactForm } from "@/components/contact/contact-form"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-playfair font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Get in Touch</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions about our products or want to learn more about our businesses? We'd love to hear from you!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="font-playfair font-display text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="font-playfair font-display text-2xl font-bold text-foreground mb-6">Contact Information</h2>

              <div className="space-y-6">
                <Card className="border border-border bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Mail className="w-6 h-6 text-enkaji-gold mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Email</h3>
                        <p className="text-muted-foreground">hello@enkaji.com</p>
                        <p className="text-muted-foreground">support@enkaji.com</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Phone className="w-6 h-6 text-enkaji-gold mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Phone</h3>
                        <p className="text-muted-foreground">+254 794 773 456</p>
                        <p className="text-sm text-muted-foreground">Monday - Friday, 9AM - 6PM EAT</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <MapPin className="w-6 h-6 text-enkaji-gold mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Address</h3>
                        <p className="text-muted-foreground">
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

                <Card className="border border-border bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <MessageCircle className="w-6 h-6 text-enkaji-gold mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">WhatsApp</h3>
                        <p className="text-muted-foreground">+254 792 687 584</p>
                        <p className="text-sm text-muted-foreground">Quick support via WhatsApp</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* FAQ Link */}
              <div className="mt-8 p-6 bg-enkaji-gold/10 rounded-lg border border-enkaji-gold/20">
                <h3 className="font-semibold text-lg mb-2">Frequently Asked Questions</h3>
                <p className="text-muted-foreground mb-4">
                  Find quick answers to common questions about orders, shipping, and our artisans.
                </p>
                <a href="/faq" className="text-enkaji-gold hover:text-enkaji-gold/80 font-medium transition-colors">
                  Visit our FAQ →
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <WhatsAppButton />
    </div>
  )
}
