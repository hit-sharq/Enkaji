import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-enkaji-ink text-enkaji-ivory">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-enkaji-gold to-enkaji-ochre rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-display">Enkaji Trade Kenya</span>
                <span className="text-xs text-muted-foreground -mt-1">Kenya's B2B Marketplace</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Connecting Kenyan businesses and entrepreneurs through a comprehensive B2B marketplace. Empowering local
              commerce and fostering economic growth across all 47 counties.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-muted-foreground hover:text-enkaji-gold cursor-pointer" />
              <Twitter className="w-5 h-5 text-muted-foreground hover:text-enkaji-gold cursor-pointer" />
              <Instagram className="w-5 h-5 text-muted-foreground hover:text-enkaji-gold cursor-pointer" />
            </div>
            <div className="pt-4 mt-2 border-t border-enkaji-gold/15">
              <p className="text-xs text-muted-foreground">
                A flagship project by{" "}
                <a
                  href="https://www.lumyn.co.ke/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-enkaji-gold hover:text-enkaji-gold/80 font-medium"
                >
                  Lumyn
                </a>{" "}
                — maintained by Lumyn.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                  Shop Products
                </Link>
              </li>
              <li>
              <Link href="/dashboard/clearance/apply" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                Sell Clearance Deals
              </Link>
              </li>
              <li>
                <Link href="/sellers" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                  Browse Sellers
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/sell" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                  Start Selling
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                  Blog & News
                </Link>
              </li>
            </ul>
          </div>

          {/* For Businesses */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">For Businesses</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sell" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link href="/bulk-orders" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                  Bulk Orders
                </Link>
              </li>
              <li>
                <Link href="/rfq" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                  Request Quotation
                </Link>
              </li>
              <li>
                <Link href="/business-solutions" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                  Business Solutions
                </Link>
              </li>
              <li>
                <Link href="/trade-assurance" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                  Trade Assurance
                </Link>
              </li>
              <li>
                <Link href="/logistics" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                  Logistics Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact & Support</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">+254 700 000 000</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">support@enkajitrade.co.ke</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Nairobi, Kenya</span>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                  Returns & Refunds
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-enkaji-gold/15 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">© 2026 Enkaji Trade Kenya. All rights reserved.</div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-muted-foreground hover:text-enkaji-gold transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
          <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
            <span>Enkaji Trade Kenya is a registered trademark. Connecting businesses across all 47 counties of Kenya.</span>
            <a
              href="https://www.lumyn.co.ke/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-enkaji-gold hover:text-enkaji-gold/80 font-medium"
            >
              Maintained by Lumyn
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
