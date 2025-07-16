import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, Globe, Award } from "lucide-react"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-800 to-orange-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-6">About Enkaji</h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Connecting the world with authentic Masai craftsmanship while preserving cultural heritage
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
                <div className="space-y-4 text-lg text-gray-700">
                  <p>
                    Enkaji, meaning "home" in Maa language, was born from a vision to create a bridge between
                    traditional Masai craftsmanship and the global marketplace. Founded in 2024, we recognized the
                    incredible talent of Masai artisans whose beautiful handmade crafts deserved worldwide recognition.
                  </p>
                  <p>
                    Our platform empowers Masai artisans by providing them with direct access to international markets,
                    ensuring fair compensation for their work while preserving centuries-old traditions and techniques
                    passed down through generations.
                  </p>
                  <p>
                    Every purchase on Enkaji directly supports artisan communities in Kenya, contributing to sustainable
                    livelihoods and cultural preservation.
                  </p>
                </div>
              </div>
              <div className="relative">
                <Image
                  src="/placeholder.jpg"
                  alt="Masai artisan at work"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                These core values guide everything we do at Enkaji
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center">
                <CardContent className="p-8">
                  <Heart className="w-12 h-12 text-red-800 mx-auto mb-4" />
                  <h3 className="font-semibold text-xl mb-3">Authenticity</h3>
                  <p className="text-gray-600">
                    Every product is genuinely handmade by skilled Masai artisans using traditional techniques
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-8">
                  <Users className="w-12 h-12 text-red-800 mx-auto mb-4" />
                  <h3 className="font-semibold text-xl mb-3">Community</h3>
                  <p className="text-gray-600">
                    Supporting artisan communities and fostering sustainable economic growth
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-8">
                  <Globe className="w-12 h-12 text-red-800 mx-auto mb-4" />
                  <h3 className="font-semibold text-xl mb-3">Global Impact</h3>
                  <p className="text-gray-600">
                    Connecting cultures and creating positive change through ethical commerce
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-8">
                  <Award className="w-12 h-12 text-red-800 mx-auto mb-4" />
                  <h3 className="font-semibold text-xl mb-3">Quality</h3>
                  <p className="text-gray-600">
                    Maintaining the highest standards in craftsmanship and customer service
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Impact</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Together, we're making a difference in artisan communities
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-red-800 mb-2">150+</div>
                <div className="text-lg font-semibold mb-2">Artisans Supported</div>
                <p className="text-gray-600">Providing sustainable income to Masai artisans and their families</p>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-red-800 mb-2">50+</div>
                <div className="text-lg font-semibold mb-2">Countries Reached</div>
                <p className="text-gray-600">Sharing Masai culture and craftsmanship with the world</p>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-red-800 mb-2">$100K+</div>
                <div className="text-lg font-semibold mb-2">Direct Income Generated</div>
                <p className="text-gray-600">Fair compensation directly to artisan communities</p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Passionate individuals working to bridge cultures through commerce
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <Image
                  src="/placeholder-user.jpg"
                  alt="Team member"
                  width={200}
                  height={200}
                  className="rounded-full mx-auto mb-4"
                />
                <h3 className="font-semibold text-xl mb-2">Sarah Kimani</h3>
                <p className="text-red-800 font-medium mb-2">Founder & CEO</p>
                <p className="text-gray-600">Passionate about cultural preservation and sustainable commerce</p>
              </div>

              <div className="text-center">
                <Image
                  src="/placeholder-user.jpg"
                  alt="Team member"
                  width={200}
                  height={200}
                  className="rounded-full mx-auto mb-4"
                />
                <h3 className="font-semibold text-xl mb-2">James Sankale</h3>
                <p className="text-red-800 font-medium mb-2">Artisan Relations</p>
                <p className="text-gray-600">Connecting with artisan communities and ensuring fair partnerships</p>
              </div>

              <div className="text-center">
                <Image
                  src="/placeholder-user.jpg"
                  alt="Team member"
                  width={200}
                  height={200}
                  className="rounded-full mx-auto mb-4"
                />
                <h3 className="font-semibold text-xl mb-2">Maria Santos</h3>
                <p className="text-red-800 font-medium mb-2">Global Operations</p>
                <p className="text-gray-600">Managing international shipping and customer experience</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
