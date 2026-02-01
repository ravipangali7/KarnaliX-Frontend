import { Link } from "react-router-dom";
import { Gamepad2, Mail, Phone, MessageCircle, Shield, Award, Clock } from "lucide-react";

const footerLinks = {
  games: [
    { name: "Card Games", href: "/games/cards" },
    { name: "Casino Games", href: "/games/casino" },
    { name: "Sports Betting", href: "/sports" },
    { name: "Live Casino", href: "/live-casino" },
    { name: "Crash Games", href: "/games/crash" },
    { name: "Lottery", href: "/games/lottery" },
  ],
  support: [
    { name: "Help Center", href: "/help" },
    { name: "FAQ", href: "/faq" },
    { name: "Live Chat", href: "/chat" },
    { name: "Contact Us", href: "/contact" },
    { name: "Game Guides", href: "/guides" },
  ],
  legal: [
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Responsible Gaming", href: "/responsible-gaming" },
    { name: "KYC Policy", href: "/kyc" },
    { name: "Refund Policy", href: "/refunds" },
  ],
  about: [
    { name: "About Us", href: "/about" },
    { name: "Affiliate Program", href: "/affiliate" },
    { name: "Careers", href: "/careers" },
    { name: "Blog", href: "/blog" },
  ],
};

const paymentMethods = ["eSewa", "Khalti", "Bank Transfer", "UPI", "Cards"];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Logo & Info */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold gradient-text">KarnaliX</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4 max-w-xs">
              Nepal's premier online gaming and betting platform. Play responsibly, win big!
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a href="tel:+918000825980" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                +91 80008 25980
              </a>
              <a href="mailto:support@karnalix.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                support@karnalix.com
              </a>
              <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-neon-green transition-colors">
                <MessageCircle className="w-4 h-4" />
                WhatsApp Support
              </a>
            </div>
          </div>

          {/* Games */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Games</h4>
            <ul className="space-y-2">
              {footerLinks.games.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">About</h4>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust Badges & Payment Methods */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-5 h-5 text-neon-green" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="w-5 h-5 text-accent" />
                <span>Licensed Gaming</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-5 h-5 text-primary" />
                <span>24/7 Support</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Payment Methods:</span>
              <div className="flex gap-2">
                {paymentMethods.map((method) => (
                  <span key={method} className="px-3 py-1 bg-muted rounded-md text-xs font-medium">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-background/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2024 KarnaliX. All rights reserved. Play responsibly.</p>
            <p className="text-center">
              <span className="text-neon-red">18+</span> | Gambling can be addictive. Please play responsibly.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
