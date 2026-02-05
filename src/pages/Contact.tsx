import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { useContact } from "@/hooks/useContact";
import { buildWhatsAppLinks } from "@/components/layout/WhatsAppButton";

export default function Contact() {
  const contact = useContact();
  const whatsAppHref = buildWhatsAppLinks(contact.whatsapp_number).support;
  const phone = contact.phone || "+91 80008 25980";
  const email = contact.email || "support@karnalix.com";
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="pt-28 pb-20 md:pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
          <p className="text-muted-foreground mb-8">
            Get in touch with our support team for any queries.
          </p>
          <div className="space-y-4">
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
              <Phone className="w-5 h-5" />
              {phone}
            </a>
            <a href={`mailto:${email}`} className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
              <Mail className="w-5 h-5" />
              {email}
            </a>
            <a href={whatsAppHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
              <MessageCircle className="w-5 h-5" />
              WhatsApp Support
            </a>
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
      <WhatsAppButton />
    </div>
  );
}
