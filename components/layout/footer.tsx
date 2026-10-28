import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, ArrowRight } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-enkaji-charcoal text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-enkaji-orange to-enkaji-orange">
                <span className="text-lg font-bold text-enkaji-ink">E</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight">Enkaji Trade Kenya</span>
                <span className="-mt-0.5 text-xs text-white/50">Kenya's B2B Marketplace</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              Connecting Kenyan businesses and entrepreneurs through a comprehensive B2B marketplace. Empowering local
              commerce and fostering economic growth across all 47 counties.
            </p>
            <div className="flex space-x-3">
              <a href="#" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-enkaji-orange/40 hover:text-enkaji-orange">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Twitter" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-enkaji-orange/40 hover:text-enkaji-orange">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-enkaji-orange/40 hover:text-enkaji-orange">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-white/50">
                A flagship project by{" "}
                <a
                  href="https://www.lumyn.co.ke/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-enkaji-orange hover:text-enkaji-orange/80"
                >
                  Lumyn
                </a>{" "}
                — maintained by Lumyn.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="group inline-flex items-center text-white/60 transition-colors hover:text-enkaji-orange">
                  About Us
                  <ArrowRight className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link href="/shop" className="group inline-flex items-center text-white/60 transition-colors hover:text-enkaji-orange">
                  Shop Products
                  <ArrowRight className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link href="/dashboard/clearance/apply" className="group inline-flex items-center text-white/60 transition-colors hover:text-enkaji-orange">
                  Sell Clearance Deals
                  <ArrowRight className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link href="/sellers" className="group inline-flex items-center text-white/60 transition-colors hover:text-enkaji-orange">
                  Browse Sellers
                  <ArrowRight className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link href="/categories" className="group inline-flex items-center text-white/60 transition-colors hover:text-enkaji-orange">
                  Categories
                  <ArrowRight className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link href="/sell" className="group inline-flex items-center text-white/60 transition-colors hover:text-enkaji-orange">
                  Start Selling
                  <ArrowRight className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link href="/blog" className="group inline-flex items-center text-white/60 transition-colors hover:text-enkaji-orange">
                  Blog & News
                  <ArrowRight className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
            </ul>
          </div>

          {/* For Businesses */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">For Businesses</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/sell" className="group inline-flex items-center text-white/60 transition-colors hover:text-enkaji-orange">
                  Become a Seller
                  <ArrowRight className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link href="/bulk-orders" className="group inline-flex items-center text-white/60 transition-colors hover:text-enkaji-orange">
                  Bulk Orders
                  <ArrowRight className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link href="/rfq" className="group inline-flex items-center text-white/60 transition-colors hover:text-enkaji-orange">
                  Request Quotation
                  <ArrowRight className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link href="/business-solutions" className="group inline-flex items-center text-white/60 transition-colors hover:text-enkaji-orange">
                  Business Solutions
                  <ArrowRight className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link href="/trade-assurance" className="group inline-flex items-center text-white/60 transition-colors hover:text-enkaji-orange">
                  Trade Assurance
                  <ArrowRight className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link href="/logistics" className="group inline-flex items-center text-white/60 transition-colors hover:text-enkaji-orange">
                  Logistics Support
                  <ArrowRight className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Contact & Support</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2.5">
                <Phone className="h-4 w-4 text-enkaji-orange" />
                <span className="text-white/60">+254 700 000 000</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="h-4 w-4 text-enkaji-orange" />
                <span className="text-white/60">support@enkajitrade.co.ke</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <MapPin className="h-4 w-4 text-enkaji-orange" />
                <span className="text-white/60">Nairobi, Kenya</span>
              </div>
            </div>
            <ul className="mt-5 space-y-2.5 text-sm">
              <li>
                <Link href="/help" className="text-white/60 transition-colors hover:text-enkaji-orange">Help Center</Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/60 transition-colors hover:text-enkaji-orange">Contact Us</Link>
              </li>
              <li>
                <Link href="/faq" className="text-white/60 transition-colors hover:text-enkaji-orange">FAQ</Link>
              </li>
              <li>
                <Link href="/shipping" className="text-white/60 transition-colors hover:text-enkaji-orange">Shipping Info</Link>
              </li>
              <li>
                <Link href="/returns" className="text-white/60 transition-colors hover:text-enkaji-orange">Returns & Refunds</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-10 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm md:flex-row">
            <div className="text-white/50">© 2026 Enkaji Trade Kenya. All rights reserved.</div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-white/60 transition-colors hover:text-enkaji-orange">Privacy Policy</Link>
              <Link href="/terms" className="text-white/60 transition-colors hover:text-enkaji-orange">Terms of Service</Link>
              <Link href="/cookies" className="text-white/60 transition-colors hover:text-enkaji-orange">Cookie Policy</Link>
            </div>
          </div>
          <div className="mt-4 flex flex-col items-center justify-between gap-2 text-xs text-white/40 md:flex-row">
            <span>Enkaji Trade Kenya is a registered trademark. Connecting businesses across all 47 counties of Kenya.</span>
            <a
              href="https://www.lumyn.co.ke/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-enkaji-orange hover:text-enkaji-orange/80"
            >
              Maintained by Lumyn
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
