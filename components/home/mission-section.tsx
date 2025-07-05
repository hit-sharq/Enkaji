import { Heart, Users, Globe } from "lucide-react"

export function MissionSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Enkaji connects the world with authentic Masai craftsmanship, empowering artisans and preserving cultural
            heritage while creating sustainable livelihoods.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-red-800" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Authentic Craftsmanship</h3>
            <p className="text-gray-600">
              Every piece is handmade using traditional techniques passed down through generations, ensuring
              authenticity and cultural significance.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Community Empowerment</h3>
            <p className="text-gray-600">
              We work directly with Masai artisans, ensuring fair wages and supporting local communities through
              sustainable economic opportunities.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Cultural Preservation</h3>
            <p className="text-gray-600">
              By supporting traditional crafts, we help preserve Masai culture and share its beauty with the world while
              respecting its origins.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
