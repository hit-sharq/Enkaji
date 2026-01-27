import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Globe, Award, TrendingUp, Shield, Handshake, Target, CheckCircle, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-blue-600/20 text-blue-100 border-blue-400/30 px-4 py-2">
                About Enkaji Trade Kenya
              </Badge>
              <h1 className="font-bold text-4xl md:text-6xl mb-6 leading-tight">
                Empowering Kenya's
                <span className="block text-orange-400">Business Ecosystem</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
                Connecting businesses across all 47 counties through Kenya's premier B2B marketplace, fostering economic
                growth and sustainable partnerships.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sellers">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3">
                    Browse Suppliers
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/sell">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3 bg-transparent"
                  >
                    Join as Supplier
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-900 mb-2">5,000+</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">Verified Suppliers</div>
                <p className="text-gray-600 text-sm">Across all business sectors</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-900 mb-2">47</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">Counties Covered</div>
                <p className="text-gray-600 text-sm">Nationwide presence</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-900 mb-2">50K+</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">Products Listed</div>
                <p className="text-gray-600 text-sm">Diverse product catalog</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-900 mb-2">₹2B+</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">Trade Volume</div>
                <p className="text-gray-600 text-sm">Annual transaction value</p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">Our Story</Badge>
                <h2 className="font-bold text-3xl md:text-4xl text-gray-900 mb-6 leading-tight">
                  Building Kenya's Digital Commerce Future
                </h2>
                <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                  <p>
                    Founded in 2024, Enkaji Trade Kenya emerged from a vision to digitize and streamline
                    business-to-business commerce across Kenya. We recognized the immense potential of Kenyan businesses
                    and the need for a unified platform to connect suppliers with buyers.
                  </p>
                  <p>
                    Our platform bridges the gap between traditional commerce and digital innovation, providing
                    businesses with the tools they need to expand their reach, increase efficiency, and build lasting
                    partnerships across all 47 counties.
                  </p>
                  <p>
                    Today, we're proud to be Kenya's fastest-growing B2B marketplace, facilitating millions of shillings
                    in trade monthly while supporting the growth of local businesses and contributing to Kenya's
                    economic development.
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-4">
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">ISO 27001 Certified</span>
                  </div>
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">Kenya Bureau of Standards Approved</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/image (2).jpg"
                    alt="Modern Kenyan business environment"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">300% Growth</div>
                      <div className="text-sm text-gray-600">Year over year</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-orange-100 text-orange-800 border-orange-200">Our Values</Badge>
              <h2 className="font-bold text-3xl md:text-4xl text-gray-900 mb-4">What Drives Us Forward</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                These core values guide every decision we make and every relationship we build
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                    <Shield className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-bold text-xl mb-4 text-gray-900">Trust & Security</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Ensuring secure transactions and verified businesses for peace of mind in every business deal
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-600 transition-colors duration-300">
                    <Users className="w-8 h-8 text-green-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-bold text-xl mb-4 text-gray-900">Community First</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Supporting local businesses and fostering a collaborative ecosystem for mutual growth
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600 transition-colors duration-300">
                    <Target className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-bold text-xl mb-4 text-gray-900">Innovation</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Continuously improving our platform with cutting-edge technology and user-centric features
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-600 transition-colors duration-300">
                    <Award className="w-8 h-8 text-orange-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-bold text-xl mb-4 text-gray-900">Excellence</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Maintaining the highest standards in service delivery and customer satisfaction
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">Our Impact</Badge>
              <h2 className="font-bold text-3xl md:text-4xl text-gray-900 mb-4">
                Transforming Kenya's Business Landscape
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Measurable results that demonstrate our commitment to Kenya's economic growth
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <Card className="text-center p-8 border-0 shadow-lg bg-white">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Handshake className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">15,000+</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">Business Partnerships</div>
                <p className="text-gray-600">Successful connections made between suppliers and buyers</p>
              </Card>

              <Card className="text-center p-8 border-0 shadow-lg bg-white">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">47/47</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">Counties Reached</div>
                <p className="text-gray-600">Complete nationwide coverage across all Kenyan counties</p>
              </Card>

              <Card className="text-center p-8 border-0 shadow-lg bg-white">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">KSh 5B+</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">Trade Facilitated</div>
                <p className="text-gray-600">Total value of transactions processed through our platform</p>
              </Card>
            </div>

            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="font-bold text-2xl md:text-3xl text-gray-900 mb-6">Supporting Kenya's Vision 2030</h3>
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    Our platform directly contributes to Kenya's economic transformation agenda by digitizing trade,
                    improving business efficiency, and creating opportunities for growth across all sectors.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-900">Digital Transformation</div>
                        <div className="text-gray-600">Helping businesses transition to digital commerce</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-900">Job Creation</div>
                        <div className="text-gray-600">Supporting employment through business growth</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-900">Economic Inclusion</div>
                        <div className="text-gray-600">Connecting rural and urban businesses</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <Image
                    src="/image (3).jpg"
                    alt="Kenya economic growth visualization"
                    width={600}
                    height={400}
                    className="rounded-xl shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-gray-100 text-gray-800 border-gray-200">Our Leadership</Badge>
              <h2 className="font-bold text-3xl md:text-4xl text-gray-900 mb-4">Meet the Visionaries</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Experienced leaders driving Kenya's B2B commerce transformation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <Image
                      src="/placeholder.svg?height=200&width=200"
                      alt="CEO"
                      width={200}
                      height={200}
                      className="rounded-full mx-auto shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-gray-900">Sarah Kimani</h3>
                  <p className="text-blue-600 font-semibold mb-3">Founder & CEO</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Former McKinsey consultant with 15+ years in digital transformation and African market development.
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      Strategy
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Leadership
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <Image
                      src="/placeholder.svg?height=200&width=200"
                      alt="CTO"
                      width={200}
                      height={200}
                      className="rounded-full mx-auto shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full border-4 border-white"></div>
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-gray-900">James Mwangi</h3>
                  <p className="text-blue-600 font-semibold mb-3">Chief Technology Officer</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Tech veteran with experience at Safaricom and iHub, specializing in scalable platforms and fintech
                    solutions.
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      Technology
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Innovation
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <Image
                      src="/placeholder.svg?height=200&width=200"
                      alt="COO"
                      width={200}
                      height={200}
                      className="rounded-full mx-auto shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-500 rounded-full border-4 border-white"></div>
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-gray-900">Grace Wanjiku</h3>
                  <p className="text-blue-600 font-semibold mb-3">Chief Operations Officer</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Operations expert with deep knowledge of Kenyan supply chains and logistics networks across all 47
                    counties.
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      Operations
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Logistics
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-bold text-3xl md:text-4xl mb-6">Ready to Transform Your Business?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of Kenyan businesses already growing with Enkaji Trade Kenya
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sell">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3">
                    Start Selling Today
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3 bg-transparent"
                  >
                    Browse Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <WhatsAppButton />
    </div>
  )
}
