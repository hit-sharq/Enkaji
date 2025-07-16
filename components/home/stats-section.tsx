import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Users, Globe, Shield } from "lucide-react"

const stats = [
  {
    icon: TrendingUp,
    value: "$2.5B+",
    label: "Transaction Volume",
    description: "Annual gross merchandise value",
  },
  {
    icon: Users,
    value: "50M+",
    label: "Active Users",
    description: "Buyers and sellers worldwide",
  },
  {
    icon: Globe,
    value: "190+",
    label: "Countries",
    description: "Global marketplace reach",
  },
  {
    icon: Shield,
    value: "99.9%",
    label: "Secure Transactions",
    description: "Protected by advanced security",
  },
]

export function StatsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted by Millions Worldwide</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join the world's largest B2B marketplace and connect with suppliers and buyers globally
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">{stat.label}</div>
                <div className="text-sm text-gray-500">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
