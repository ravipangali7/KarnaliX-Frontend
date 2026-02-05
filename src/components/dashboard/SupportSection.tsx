import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MessageCircle,
  Headphones,
  Mail,
  Clock,
  Send,
  Plus,
  ChevronRight,
  Loader2,
  HelpCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { buildWhatsAppLinks } from "@/components/layout/WhatsAppButton";
import { useContact } from "@/hooks/useContact";
import apiClient from "@/lib/api";

interface Ticket {
  id: string | number;
  subject: string;
  category: string;
  status: string;
  createdAt: string;
  lastUpdate: string;
  messages: number;
}

function getDefaultFaqs(minWithdraw: number) {
  return [
    { q: "How do I deposit funds?", a: "You can deposit using eSewa, Khalti, Bank Transfer, or UPI from the Deposit page." },
    { q: "How long do withdrawals take?", a: "Withdrawals are processed within 24-48 hours after verification." },
    { q: "How do I verify my account?", a: "Go to Profile > KYC Verification and upload your government ID and selfie." },
    { q: "What is the minimum withdrawal?", a: `The minimum withdrawal amount is ₹${minWithdraw}.` },
  ];
}

export function SupportSection() {
  const contact = useContact();
  const whatsAppSupportHref = buildWhatsAppLinks(contact.whatsapp_number).support;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>(() => getDefaultFaqs(500));
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "OTHER",
    message: "",
  });

  const fetchTickets = async () => {
    try {
      const res = await apiClient.getUserTickets();
      const list = res?.results ?? res ?? [];
      setTickets((Array.isArray(list) ? list : []).map((t: any) => ({
        id: t.id,
        subject: t.subject || "",
        category: t.category || "OTHER",
        status: (t.status || "OPEN").toLowerCase().replace(" ", "_"),
        createdAt: t.created_at ? new Date(t.created_at).toLocaleDateString() : "",
        lastUpdate: t.updated_at ? new Date(t.updated_at).toLocaleString() : "",
        messages: t.messages_count ?? 0,
      })));
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const content = await apiClient.getPublicContent();
        if (cancelled) return;
        const list = content?.faq;
        if (Array.isArray(list) && list.length > 0) {
          setFaqs(list.map((item: { q?: string; a?: string }) => ({
            q: item.q ?? "",
            a: item.a ?? "",
          })));
        }
      } catch {
        if (!cancelled) setFaqs(getDefaultFaqs(contact.min_withdraw));
      }
    })();
    return () => { cancelled = true; };
  }, [contact.min_withdraw]);

  const handleSubmitTicket = async () => {
    if (!newTicket.subject || !newTicket.message) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.createUserTicket({
        subject: newTicket.subject,
        category: newTicket.category,
        message: newTicket.message,
      });
      setShowNewTicket(false);
      setNewTicket({ subject: "", category: "OTHER", message: "" });
      toast.success("Ticket submitted successfully! We'll respond within 24 hours.");
      fetchTickets();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to submit ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">Open</span>;
      case "in_progress":
        return <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">In Progress</span>;
      case "resolved":
        return <span className="text-xs px-2 py-1 rounded-full bg-neon-green/10 text-neon-green">Resolved</span>;
      case "closed":
        return <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">Closed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Contact Options */}
      <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
        <a
          href={whatsAppSupportHref}
          target="_blank"
          rel="noopener noreferrer"
          className="glass rounded-xl p-4 sm:p-6 hover:border-[#25D366]/50 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#25D366]/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#25D366]" />
            </div>
            <div>
              <p className="font-semibold text-sm sm:text-base">WhatsApp</p>
              <p className="text-xs text-muted-foreground">Instant Response</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Chat with us anytime</p>
        </a>

        <div className="glass rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm sm:text-base">Live Chat</p>
              <p className="text-xs text-neon-green flex items-center gap-1">
                <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                Online
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-2" asChild>
            <a href="/chat">Start Chat</a>
          </Button>
        </div>

        <div className="glass rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-sm sm:text-base">Email</p>
              <p className="text-xs text-muted-foreground">{contact.email || "support@karnalix.com"}</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> Response within 24 hours
          </p>
        </div>
      </div>

      {/* Support Tickets */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Support Tickets
          </h3>
          <Button
            variant={showNewTicket ? "outline" : "neon"}
            size="sm"
            onClick={() => setShowNewTicket(!showNewTicket)}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            {showNewTicket ? "Cancel" : "New Ticket"}
          </Button>
        </div>

        {showNewTicket && (
          <div className="mb-6 p-4 bg-muted/30 rounded-xl border border-border space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Brief description of your issue"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-muted border border-border"
                >
                  <option value="OTHER">General</option>
                  <option value="PAYMENT">Payments</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="ACCOUNT">Account</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Describe your issue in detail..."
                value={newTicket.message}
                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                rows={4}
              />
            </div>
            <Button
              onClick={handleSubmitTicket}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submit Ticket
                </>
              )}
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="text-muted-foreground text-sm">No tickets yet. Create one above if you need help.</p>
          ) : (
          tickets.map((ticket) => (
            <div
              key={String(ticket.id)}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">{ticket.id}</span>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <p className="font-medium text-sm">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.category} • Updated {ticket.lastUpdate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" /> {ticket.messages}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          ))
          )}
        </div>
      </div>

      {/* FAQ */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="group">
              <summary className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <span className="font-medium text-sm">{faq.q}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
              </summary>
              <div className="p-3 text-sm text-muted-foreground">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
