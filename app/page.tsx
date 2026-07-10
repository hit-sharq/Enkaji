import { HeroSection } from "@/components/home/hero-section"
import { CategoriesSection } from "@/components/home/categories-section"
import { HotClearanceDeals } from "@/components/home/hot-clearance-deals"
import { ClearanceCTASection } from "@/components/home/clearance-cta-section"
import { FeaturedProducts } from "@/components/home/featured-products"
import { StatsSection } from "@/components/home/stats-section"
import { TestimonialsSection } from "@/components/home/testimonials-section"
import { MissionSection } from "@/components/home/mission-section"
import { NewsletterSection } from "@/components/home/newsletter-section"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <CategoriesSection />
      <HotClearanceDeals />
      <ClearanceCTASection />
      <FeaturedProducts />
      <StatsSection />
      <TestimonialsSection />
      <MissionSection />
      <NewsletterSection />
    </div>
  )
}
