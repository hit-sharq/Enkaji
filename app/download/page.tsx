import Link from "next/link"
import { Download, Smartphone, ShieldCheck, Zap, ShoppingBag, CreditCard, Bell, Star, ChevronRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Download Enkaji Mobile App | Enkaji Trade Kenya",
  description: "Download the Enkaji Trade Kenya mobile app and shop thousands of verified Kenyan suppliers from your phone.",
}

const features = [
  {
    icon: ShoppingBag,
    title: "Browse & Shop",
    desc: "Access thousands of verified Kenyan suppliers and artisans from anywhere.",
  },
  {
    icon: CreditCard,
    title: "M-Pesa Payments",
    desc: "Pay instantly with M-Pesa, cards, or bank transfer — fully secured.",
  },
  {
    icon: Bell,
    title: "Order Tracking",
    desc: "Get real-time updates on your orders from placement to delivery.",
  },
  {
    icon: Zap,
    title: "Fast & Lightweight",
    desc: "Designed for Kenyan networks — works great even on 3G connections.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Trusted",
    desc: "All sellers are verified. Your data and payments are fully protected.",
  },
  {
    icon: Star,
    title: "Sell on the Go",
    desc: "Manage your store, listings, and orders directly from the app.",
  },
]

const steps = [
  {
    number: "01",
    title: "Download the APK",
    desc: 'Tap the "Download APK" button above to download the Enkaji app file to your Android device.',
  },
  {
    number: "02",
    title: "Allow Unknown Sources",
    desc: 'Go to Settings → Security (or Privacy) → enable "Install Unknown Apps" for your browser or file manager.',
  },
  {
    number: "03",
    title: "Open the File",
    desc: "Open the downloaded enkaji-mobile.apk file from your notifications or Downloads folder.",
  },
  {
    number: "04",
    title: "Install & Enjoy",
    desc: 'Tap "Install", wait a few seconds, then open Enkaji and sign in to your account.',
  },
]

export default function DownloadPage() {
  const apkUrl = process.env.NEXT_PUBLIC_APK_URL || "/downloads/enkaji-mobile.apk"
  const apkAvailable = process.env.NEXT_PUBLIC_APK_URL !== undefined

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#8B2635] via-[#7a1f2e] to-[#5c1520] text-white py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/20">
                Android App
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Kenya's Marketplace,
                <span className="text-[#EAB308]"> in Your Pocket</span>
              </h1>
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                Shop from thousands of verified Kenyan suppliers, pay with M-Pesa, track your orders, and manage your store — all from the Enkaji mobile app.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href={apkUrl} download="enkaji-mobile.apk">
                  <Button
                    size="lg"
                    className="bg-[#EAB308] hover:bg-yellow-500 text-black font-bold px-8 py-6 text-lg rounded-xl shadow-xl"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download APK
                  </Button>
                </a>
                <div className="flex items-center text-white/70 text-sm">
                  <ShieldCheck className="w-4 h-4 mr-1 text-green-400" />
                  Free · Android 8.0+ · ~35 MB
                </div>
              </div>

              {!apkAvailable && (
                <div className="mt-6 flex items-start gap-2 bg-white/10 border border-white/20 rounded-lg p-4 text-sm text-white/80">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-yellow-400 shrink-0" />
                  <span>
                    The APK is being finalized. Check back soon or{" "}
                    <Link href="/contact" className="underline text-yellow-400">contact us</Link> to be notified when it's ready.
                  </span>
                </div>
              )}
            </div>

            {/* Right: Phone Mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Phone frame */}
                <div className="w-64 h-[500px] bg-gray-900 rounded-[40px] border-4 border-gray-700 shadow-2xl overflow-hidden relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl z-10" />
                  {/* Screen */}
                  <div className="w-full h-full bg-gradient-to-b from-[#8B2635] to-[#5c1520] flex flex-col">
                    {/* App header */}
                    <div className="px-4 pt-10 pb-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-[#8B2635]" />
                        </div>
                        <span className="text-white font-bold text-sm">Enkaji Trade</span>
                      </div>
                      <p className="text-white/60 text-xs">Good morning!</p>
                      <p className="text-white font-semibold text-sm">What are you looking for?</p>
                      {/* Search bar */}
                      <div className="mt-3 bg-white/20 rounded-full px-3 py-2 flex items-center gap-2">
                        <div className="w-3 h-3 border border-white/60 rounded-full" />
                        <span className="text-white/60 text-xs">Search products...</span>
                      </div>
                    </div>
                    {/* Product cards */}
                    <div className="px-4 flex-1">
                      <p className="text-white/80 text-xs font-semibold mb-2">Featured Products</p>
                      <div className="space-y-2">
                        {["Maasai Jewellery", "Kenyan Coffee Blend", "Kitenge Fabric"].map((name, i) => (
                          <div key={i} className="bg-white/15 rounded-xl p-3 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/30 rounded-lg" />
                            <div className="flex-1">
                              <p className="text-white text-xs font-medium">{name}</p>
                              <p className="text-yellow-400 text-xs">KES {[1200, 850, 450][i]}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Bottom nav */}
                    <div className="bg-white/10 px-6 py-3 flex justify-around">
                      {[ShoppingBag, Zap, ShoppingBag, Star].map((Icon, i) => (
                        <div key={i} className={`w-5 h-5 ${i === 0 ? "text-yellow-400" : "text-white/50"}`}>
                          <Icon className="w-full h-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 -z-10 blur-2xl bg-yellow-400/20 rounded-full scale-75 translate-y-8" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything You Need, On the Go</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              The Enkaji mobile app gives you full access to Kenya's largest B2B marketplace — wherever you are.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#8B2635]/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#8B2635]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation Steps */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How to Install</h2>
            <p className="text-gray-500 text-lg">
              Since the app is not yet on the Play Store, follow these simple steps to install it directly on your Android phone.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
            {steps.map(({ number, title, desc }) => (
              <div key={number} className="flex gap-5">
                <div className="shrink-0 w-12 h-12 bg-[#8B2635] text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {number}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 mb-1">Android Only (for now)</p>
              <p className="text-amber-700 text-sm">
                The current release is for Android phones only. An iOS version is coming soon. If you have an iPhone, you can access Enkaji via the{" "}
                <Link href="/" className="underline font-medium">web app</Link> in your browser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#8B2635] to-[#7a1f2e] text-white">
        <div className="container mx-auto max-w-3xl text-center">
          <Smartphone className="w-14 h-14 mx-auto mb-6 text-yellow-400" />
          <h2 className="text-3xl font-bold mb-4">Ready to Download?</h2>
          <p className="text-white/75 text-lg mb-8">
            Join thousands of Kenyans already buying and selling on Enkaji. It's free.
          </p>
          <a href={apkUrl} download="enkaji-mobile.apk">
            <Button
              size="lg"
              className="bg-[#EAB308] hover:bg-yellow-500 text-black font-bold px-10 py-6 text-lg rounded-xl shadow-xl"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Enkaji APK
            </Button>
          </a>
          <p className="text-white/50 text-sm mt-4">Android 8.0 or later required</p>
        </div>
      </section>
    </div>
  )
}
