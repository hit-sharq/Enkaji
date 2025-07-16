import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Users, Zap, Globe, TrendingUp, Heart } from "lucide-react"

const values = [
  {
    icon: Globe,
    title: "Nationwide Reach",
    description: "Connecting businesses across all 47 counties in Kenya with our comprehensive marketplace platform.",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: Shield,
    title: "Trust & Security",
    description:
      "Advanced verification systems and secure payment processing to ensure safe transactions for all users.",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Leveraging cutting-edge technology to simplify B2B trade and make sourcing more efficient.",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  {
    icon: Users,
    title: "Community First",
    description: "Building lasting relationships between buyers and suppliers through transparency and mutual growth.",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    icon: TrendingUp,
    title: "Growth Focused",
    description: "Empowering businesses of all sizes to scale and reach new markets across Kenya and beyond.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  {
    icon: Heart,
    title: "Local Impact",
    description: "Supporting Kenya's economy by promoting local suppliers and fostering domestic trade relationships.",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
]

export function MissionSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Transforming Kenya's B2B Landscape</h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Our mission is to digitize and streamline B2B commerce across Kenya, making it easier for businesses to
              find suppliers, compare prices, and grow their operations nationwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {values.map((value, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur hover:-translate-y-1"
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-16 h-16 ${value.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}
                  >
                    <value.icon className={`w-8 h-8 ${value.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Impact Section */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Our Impact on Kenya's Economy</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Since our launch, we've been driving digital transformation in Kenya's B2B sector
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">25,000+</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">SMEs Empowered</div>
                <p className="text-gray-600">Small and medium enterprises using our platform to grow</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">KSh 500M+</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">Monthly Trade Volume</div>
                <p className="text-gray-600">Average monthly transactions processed on our platform</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">15,000+</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">Jobs Created</div>
                <p className="text-gray-600">Direct and indirect employment opportunities generated</p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Ready to Be Part of Kenya's Digital Future?</h4>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join thousands of businesses already leveraging our platform to source products, find suppliers, and
                expand their reach across Kenya.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-semibold">
                  Start Sourcing Today
                </Button>
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 font-semibold bg-transparent"
                >
                  Register as Supplier
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
