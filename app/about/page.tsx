import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Globe, Award, TrendingUp, Shield, Handshake, Target, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

const values = [
  {
    icon: Shield,
    title: "Trust & Security",
    description:
      "Ensuring secure transactions and verified businesses for peace of mind in every business deal.",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "Supporting local businesses and fostering a collaborative ecosystem for mutual growth.",
  },
  {
    icon: Target,
    title: "Innovation",
    description:
      "Continuously improving our platform with cutting-edge technology and user-centric features.",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "Maintaining the highest standards in service delivery and customer satisfaction.",
  },
]

const stats = [
  { value: "5,000+", label: "Verified Sellers", detail: "Across all business sectors" },
  { value: "47", label: "Counties Covered", detail: "Nationwide presence" },
  { value: "50K+", label: "Products Listed", detail: "Diverse product catalog" },
  { value: "KSh 2B+", label: "Trade Volume", detail: "Annual transaction value" },
]

const impact = [
  {
    icon: Handshake,
    value: "15,000+",
    label: "Business Partnerships",
    description: "Successful connections made between sellers and buyers",
  },
  {
    icon: Globe,
    value: "47/47",
    label: "Counties Reached",
    description: "Complete nationwide coverage across all Kenyan counties",
  },
  {
    icon: TrendingUp,
    value: "KSh 5B+",
    label: "Trade Facilitated",
    description: "Total value of transactions processed through our platform",
  },
]

const team = [
  {
    initials: "SK",
    name: "Sarah Kimani",
    role: "Founder & CEO",
    bio: "Former McKinsey consultant with 15+ years in digital transformation and African market development.",
    skills: ["Strategy", "Leadership"],
  },
  {
    initials: "JM",
    name: "James Mwangi",
    role: "Chief Technology Officer",
    bio: "Tech veteran with experience at Safaricom and iHub, specializing in scalable platforms and fintech solutions.",
    skills: ["Technology", "Innovation"],
  },
  {
    initials: "GW",
    name: "Grace Wanjiku",
    role: "Chief Operations Officer",
    bio: "Operations expert with deep knowledge of Kenyan supply chains and logistics networks across all 47 counties.",
    skills: ["Operations", "Logistics"],
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-enkaji-cream/60 via-background to-enkaji-cream/40 py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <span className="enkaji-eyebrow mb-3 block">About Enkaji Trade Kenya</span>
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground mb-6 leading-tight md:text-6xl">
                Empowering Kenya's{" "}
                <span className="text-enkaji-orange">Business Ecosystem</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed md:text-xl">
                Connecting businesses across all 47 counties through Kenya's premier B2B
                marketplace, fostering economic growth and sustainable partnerships.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/sellers">
                    Browse Sellers
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-enkaji-orange/30 text-enkaji-orange hover:bg-enkaji-orange/5 bg-transparent">
                  <Link href="/sell">Join as Seller</Link>
                </Button>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
                {["ISO 27001 Certified", "Kenya Bureau of Standards Approved", "Verified Sellers Only"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 text-enkaji-orange" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="bg-card py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <span className="enkaji-eyebrow mb-3 block">Our Story</span>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-6 leading-tight md:text-4xl">
                Building Kenya's Digital Commerce Future
              </h2>
              <div className="space-y-6 text-lg text-foreground/80 leading-relaxed">
                <p>
                  Founded in 2024, Enkaji Trade Kenya emerged from a vision to digitize and
                  streamline business-to-business commerce across Kenya. We recognized the
                  immense potential of Kenyan businesses and the need for a unified platform
                  to connect sellers with buyers.
                </p>
                <p>
                  Our platform bridges the gap between traditional commerce and digital
                  innovation, providing businesses with the tools they need to expand their
                  reach, increase efficiency, and build lasting partnerships across all 47
                  counties.
                </p>
                <p>
                  Today, we're proud to be Kenya's fastest-growing B2B marketplace,
                  facilitating millions of shillings in trade monthly while supporting the
                  growth of local businesses and contributing to Kenya's economic
                  development.
                </p>
              </div>
              <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-border bg-background p-5 shadow-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-enkaji-orange/10">
                  <TrendingUp className="h-6 w-6 text-enkaji-orange" />
                </div>
                <div>
                  <div className="font-display font-bold text-foreground">300% Growth</div>
                  <div className="text-sm text-muted-foreground">Year over year</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-enkaji-ink py-16">
          <div className="container mx-auto px-4">
            <div className="mb-10 text-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-enkaji-orange/80">
                By the numbers
              </span>
            </div>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-4xl font-bold text-enkaji-ivory mb-2 md:text-5xl">
                    {stat.value}
                  </div>
                  <div className="font-semibold text-enkaji-ivory/90 mb-1">{stat.label}</div>
                  <p className="text-sm text-enkaji-ivory/60">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-background py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="enkaji-eyebrow mb-3 block">Our Values</span>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-4 md:text-4xl">
                What Drives Us Forward
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                These core values guide every decision we make and every relationship we build
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <Card
                  key={value.title}
                  className="group border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
                >
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-enkaji-orange/10 transition-colors duration-300 group-hover:bg-enkaji-orange">
                      <value.icon className="h-8 w-8 text-enkaji-orange transition-colors duration-300 group-hover:text-white" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-4">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Impact */}
        <section className="bg-muted py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="enkaji-eyebrow mb-3 block">Our Impact</span>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-4 md:text-4xl">
                Transforming Kenya's Business Landscape
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Measurable results that demonstrate our commitment to Kenya's economic growth
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-16 md:grid-cols-3">
              {impact.map((item) => (
                <Card key={item.label} className="border-border bg-card text-center shadow-card">
                  <CardContent className="p-8">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-enkaji-orange/10">
                      <item.icon className="h-8 w-8 text-enkaji-orange" />
                    </div>
                    <div className="font-display text-3xl font-bold text-enkaji-orange mb-2">{item.value}</div>
                    <div className="text-lg font-semibold text-foreground mb-2">{item.label}</div>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-border bg-card p-8 shadow-card md:p-12">
              <div className="max-w-3xl">
                <span className="enkaji-eyebrow mb-3 block">Vision 2030</span>
                <h3 className="font-display text-2xl font-bold tracking-tight text-foreground mb-6 md:text-3xl">
                  Supporting Kenya's Vision 2030
                </h3>
                <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
                  Our platform directly contributes to Kenya's economic transformation
                  agenda by digitizing trade, improving business efficiency, and creating
                  opportunities for growth across all sectors.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { title: "Digital Transformation", detail: "Helping businesses transition to digital commerce" },
                    { title: "Job Creation", detail: "Supporting employment through business growth" },
                    { title: "Economic Inclusion", detail: "Connecting rural and urban businesses" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-enkaji-orange" />
                      <div>
                        <div className="font-semibold text-foreground">{item.title}</div>
                        <div className="text-muted-foreground">{item.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Team */}
        <section className="bg-card py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="enkaji-eyebrow mb-3 block">Our Leadership</span>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-4 md:text-4xl">
                Meet the Visionaries
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experienced leaders driving Kenya's B2B commerce transformation
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto md:grid-cols-3">
              {team.map((member) => (
                <Card
                  key={member.name}
                  className="group border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
                >
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-enkaji-orange/10 ring-4 ring-enkaji-orange/10 transition-colors duration-300 group-hover:ring-enkaji-orange/20">
                      <span className="font-display text-2xl font-bold text-enkaji-orange">{member.initials}</span>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-1">{member.name}</h3>
                    <p className="font-semibold text-enkaji-orange mb-3">{member.role}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{member.bio}</p>
                    <div className="flex justify-center gap-2">
                      {member.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="rounded-full">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-enkaji-ink py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-enkaji-orange/80 mb-4 block">
                Get Started
              </span>
              <h2 className="font-display text-3xl font-bold tracking-tight text-enkaji-ivory mb-6 md:text-4xl">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl text-enkaji-ivory/80 mb-8">
                Join thousands of Kenyan businesses already growing with Enkaji Trade Kenya
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/sell">
                    Start Selling Today
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-enkaji-orange/50 bg-transparent text-enkaji-orange hover:bg-enkaji-orange/10"
                >
                  <Link href="/shop">Browse Products</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <WhatsAppButton />
    </div>
  )
}
