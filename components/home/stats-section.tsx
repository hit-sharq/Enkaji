import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Users, MapPin, Award } from "lucide-react"

const stats = [
  {
    icon: TrendingUp,
    value: "KSh 2.5B+",
    label: "Annual Trade Volume",
    description: "Total value of transactions processed",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    icon: Users,
    value: "100K+",
    label: "Active Users",
    description: "Buyers and suppliers nationwide",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: MapPin,
    value: "47/47",
    label: "Counties Covered",
    description: "Complete nationwide coverage",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    icon: Award,
    value: "99.8%",
    label: "Success Rate",
    description: "Successful order completion",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
]

export function StatsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powering Kenya's Digital Economy</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of businesses already using our platform to source products, find suppliers, and grow their
            operations across Kenya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">{stat.label}</div>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Transform Your Business?</h3>
          <p className="text-lg mb-6 opacity-90">
            Join Kenya's fastest-growing B2B marketplace and connect with suppliers nationwide
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 font-semibold">
              Start Buying Now
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 font-semibold bg-transparent"
            >
              Become a Supplier
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
