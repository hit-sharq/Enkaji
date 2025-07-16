import { Card, CardContent } from "@/components/ui/card"
import { Globe, Users, Zap, Shield } from "lucide-react"

const values = [
  {
    icon: Globe,
    title: "Global Reach",
    description: "Connect businesses across 190+ countries with our worldwide marketplace platform.",
  },
  {
    icon: Users,
    title: "Community First",
    description: "Building lasting relationships between buyers and suppliers through trust and transparency.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Leveraging cutting-edge technology to simplify global trade and commerce.",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Advanced security measures and buyer protection to ensure safe transactions.",
  },
]

export function MissionSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Connecting the World Through Commerce</h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Our mission is to make it easy for businesses of all sizes to trade globally. We're building the
              infrastructure that powers international commerce, connecting millions of suppliers and buyers worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur"
              >
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <value.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Trading?</h3>
              <p className="text-gray-600 mb-6">
                Join millions of businesses already using our platform to grow their operations globally.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                  Start Buying
                </button>
                <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors">
                  Start Selling
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
