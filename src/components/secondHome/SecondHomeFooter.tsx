import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSiteSetting, getCmsFooterPages } from "@/api/site";
import { getMediaUrl } from "@/lib/api";
import { Phone, Mail, MessageCircle, Shield, Award, Headphones } from "lucide-react";
import {
  footerContact as defaultFooterContact,
  footerLinks as defaultFooterLinks,
  paymentMethods as defaultPaymentMethods,
} from "@/data/homePageMockData";

export function SecondHomeFooter() {
  const { data: siteSetting = {} } = useQuery({ queryKey: ["siteSetting"], queryFn: getSiteSetting });
  const { data: cmsPages = [] } = useQuery({ queryKey: ["cmsFooter"], queryFn: getCmsFooterPages });

  const s = siteSetting as {
    logo?: string;
    name?: string;
    phones?: string[];
    emails?: string[];
    whatsapp_number?: string;
    footer_description?: string;
  };

  const logoUrl = s?.logo?.trim() ? getMediaUrl(s.logo.trim()) : "/karnali-logo.png";
  const siteName = s?.name?.trim() || "KarnaliX";
  const phone = Array.isArray(s?.phones) && s.phones.length > 0 ? String(s.phones[0]) : defaultFooterContact.phone;
  const email = Array.isArray(s?.emails) && s.emails.length > 0 ? String(s.emails[0]) : defaultFooterContact.email;
  const whatsapp = (s?.whatsapp_number as string)?.trim() || defaultFooterContact.whatsapp;
  const tagline = (s?.footer_description as string)?.trim() || defaultFooterContact.tagline;
  const waUrl = `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`;

  const cmsItems = cmsPages as { id?: number; title?: string; slug?: string }[];
  const legalLinks =
    cmsItems.length > 0
      ? cmsItems.map((p) => ({ label: p.title ?? "", href: `/page/${p.slug ?? ""}` }))
      : defaultFooterLinks.legal;

  return (
    <footer className="border-t border-white/8 bg-[#080b10] mt-auto">
      {/* Trust bar */}
      <div className="border-b border-white/5 bg-white/[0.02]">
        <div className="container px-4 py-3 flex flex-wrap items-center justify-center md:justify-between gap-3">
          {[
            { icon: Shield, label: "SSL Secured" },
            { icon: Award, label: "Licensed Gaming" },
            { icon: Headphones, label: "24/7 Support" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="h-3.5 w-3.5 text-primary/60" />
              <span>{label}</span>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {defaultPaymentMethods.map((pm) => (
              <span
                key={pm}
                className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-muted-foreground"
              >
                {pm}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <img src={logoUrl} alt={siteName} className="h-9 rounded-lg object-contain" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{tagline}</p>

            {/* Contact items */}
            <div className="mt-5 flex flex-col gap-2.5">
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group"
              >
                <span className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                  <Phone className="h-3.5 w-3.5" />
                </span>
                {phone}
              </a>
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group"
              >
                <span className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                  <Mail className="h-3.5 w-3.5" />
                </span>
                {email}
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-emerald-400 transition-colors group"
              >
                <span className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-emerald-500/30 transition-colors">
                  <MessageCircle className="h-3.5 w-3.5" />
                </span>
                WhatsApp
              </a>
            </div>
          </div>

          {/* Links */}
          {[
            { title: "Games", links: defaultFooterLinks.games },
            { title: "Support", links: defaultFooterLinks.support },
          ].map(({ title, links }) => (
            <div key={title}>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">{title}</p>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      to={l.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Legal (CMS) + About combined */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">Legal</p>
            <ul className="space-y-2.5 mb-6">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">Company</p>
            <ul className="space-y-2.5">
              {defaultFooterLinks.about.map((l) => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/8 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <p>18+ only. Please play responsibly.</p>
        </div>
      </div>
    </footer>
  );
}
