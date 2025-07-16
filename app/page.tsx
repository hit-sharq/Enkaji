import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { CategoriesSection } from "@/components/home/categories-section"
import { FeaturedProducts } from "@/components/home/featured-products"
import { StatsSection } from "@/components/home/stats-section"
import { MissionSection } from "@/components/home/mission-section"
import { TestimonialsSection } from "@/components/home/testimonials-section"
import { NewsletterSection } from "@/components/home/newsletter-section"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <CategoriesSection />
        <FeaturedProducts />
        <StatsSection />
        <MissionSection />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
