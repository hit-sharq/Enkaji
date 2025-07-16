import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Globe, Users, TrendingUp, Shield, Award, Heart } from "lucide-react"
import Image from "next/image"

const stats = [
  { label: "Active Users", value: "50M+", icon: Users },
  { label: "Countries Served", value: "190+", icon: Globe },
  { label: "Annual GMV", value: "$2.5B+", icon: TrendingUp },
  { label: "Secure Transactions", value: "99.9%", icon: Shield },
]

const team = [
  {
    name: "Alex Johnson",
    role: "CEO & Founder",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Former VP at Amazon, passionate about connecting global businesses.",
  },
  {
    name: "Priya Patel",
    role: "CTO",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Tech leader with 15+ years building scalable marketplace platforms.",
  },
  {
    name: "Marcus Chen",
    role: "Head of Global Operations",
    image: "/placeholder.svg?height=300&width=300",
    bio: "International trade expert with deep supply chain knowledge.",
  },
  {
    name: "Sofia Rodriguez",
    role: "VP of Customer Success",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Dedicated to ensuring every customer achieves their business goals.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">Connecting the World Through Commerce</h1>
              <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
                We're building the world's most trusted B2B marketplace, making global trade accessible to businesses of
                all sizes across every industry.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">From Startup to Global Platform</h3>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      Founded in 2018, our journey began with a simple observation: small and medium businesses
                      struggled to access global suppliers and markets. Traditional B2B trading was complex, expensive,
                      and often unreliable.
                    </p>
                    <p>
                      We set out to democratize global trade by building a platform that combines cutting-edge
                      technology with human expertise. Today, we're proud to serve millions of businesses worldwide,
                      from startups to Fortune 500 companies.
                    </p>
                    <p>
                      Our platform has facilitated over $2.5 billion in trade volume, connecting suppliers and buyers
                      across 190+ countries. But we're just getting started.
                    </p>
                  </div>
                </div>
                <div>
                  <Image
                    src="/placeholder.svg?height=400&width=600"
                    alt="Our global reach"
                    width={600}
                    height={400}
                    className="rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
                <p className="text-xl text-gray-600">The principles that guide everything we do</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Trust & Security</h3>
                    <p className="text-gray-600">
                      We prioritize security and transparency in every transaction, building trust between global
                      trading partners.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Award className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Excellence</h3>
                    <p className="text-gray-600">
                      We strive for excellence in everything we do, from product quality to customer service and
                      platform reliability.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Heart className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Customer First</h3>
                    <p className="text-gray-600">
                      Our customers' success is our success. We're committed to helping businesses grow through global
                      trade.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
                <p className="text-xl text-gray-600">The passionate people behind our global marketplace</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {team.map((member, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <Image
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        width={200}
                        height={200}
                        className="rounded-full mx-auto mb-4"
                      />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                      <p className="text-blue-600 font-semibold mb-3">{member.role}</p>
                      <p className="text-gray-600 text-sm">{member.bio}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join Our Global Community?</h2>
              <p className="text-xl text-blue-100 mb-8">
                Start trading with confidence on the world's most trusted B2B marketplace
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                  Start Buying
                </button>
                <button className="border border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                  Become a Seller
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
