import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import apiClient from "@/lib/api";
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
import { whatsAppLinks } from "@/components/layout/WhatsAppButton";

interface TicketMessage {
  id: number;
  user: number;
  username: string;
  message: string;
  is_staff: boolean;
  created_at: string;
}

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  lastUpdate: string;
  messages: TicketMessage[];
  messagesCount: number;
}

const faqs = [
  { q: "How do I deposit funds?", a: "You can deposit using eSewa, Khalti, Bank Transfer, or UPI from the Deposit page." },
  { q: "How long do withdrawals take?", a: "Withdrawals are processed within 24-48 hours after verification." },
  { q: "How do I verify my account?", a: "Go to Profile > KYC Verification and upload your government ID and selfie." },
  { q: "What is the minimum withdrawal?", a: "The minimum withdrawal amount is ₹500." },
];

export function SupportSection() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "general",
    message: "",
  });

  const fetchTickets = async () => {
    try {
      const data = await apiClient.getTickets();
      
      // Map API response to Ticket format
      const mappedTickets: Ticket[] = (data || []).map((t: any) => ({
        id: `TKT-${String(t.id).padStart(3, '0')}`,
        subject: t.subject,
        category: t.category || 'General',
        status: t.status,
        createdAt: new Date(t.created_at).toLocaleDateString(),
        lastUpdate: formatTimeAgo(t.last_update_at || t.updated_at),
        messages: t.messages || [],
        messagesCount: (t.messages || []).length,
      }));
      
      setTickets(mappedTickets);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const formatTimeAgo = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleSubmitTicket = async () => {
    if (!newTicket.subject || !newTicket.message) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await apiClient.createTicket({
        subject: newTicket.subject,
        category: newTicket.category,
        message: newTicket.message,
      });
      
      setShowNewTicket(false);
      setNewTicket({ subject: "", category: "general", message: "" });
      toast.success("Ticket submitted successfully! We'll respond within 24 hours.");
      
      // Refresh tickets
      await fetchTickets();
    } catch (error) {
      console.error('Failed to create ticket:', error);
      toast.error("Failed to submit ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    
    setIsReplying(true);
    try {
      // Extract numeric ID from TKT-XXX format
      const ticketId = selectedTicket.id.replace('TKT-', '');
      await apiClient.replyToTicket(ticketId, replyMessage);
      
      setReplyMessage("");
      toast.success("Reply sent successfully!");
      
      // Refresh tickets
      await fetchTickets();
      setSelectedTicket(null);
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error("Failed to send reply. Please try again.");
    } finally {
      setIsReplying(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Contact Options */}
      <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
        <a
          href={whatsAppLinks.support}
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
          <a href={whatsAppLinks.support} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="w-full mt-2">
              Start Chat
            </Button>
          </a>
        </div>

        <div className="glass rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-sm sm:text-base">Email</p>
              <p className="text-xs text-muted-foreground">support@karnalix.com</p>
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
                  <option value="general">General Inquiry</option>
                  <option value="payments">Payments</option>
                  <option value="technical">Technical Issue</option>
                  <option value="promotions">Promotions</option>
                  <option value="account">Account</option>
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

        {/* Ticket Detail View */}
        {selectedTicket && (
          <div className="mb-6 p-4 bg-muted/30 rounded-xl border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-muted-foreground">{selectedTicket.id}</span>
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <h4 className="font-medium">{selectedTicket.subject}</h4>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)}>
                Close
              </Button>
            </div>
            
            {/* Messages */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {selectedTicket.messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-lg ${msg.is_staff ? 'bg-primary/10 ml-4' : 'bg-muted mr-4'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{msg.is_staff ? 'Support' : msg.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{msg.message}</p>
                </div>
              ))}
            </div>
            
            {/* Reply Form */}
            {selectedTicket.status !== 'closed' && (
              <div className="flex gap-2">
                <Input
                  placeholder="Type your reply..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                />
                <Button onClick={handleReply} disabled={isReplying || !replyMessage.trim()}>
                  {isReplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tickets List */}
        {tickets.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No support tickets yet</p>
            <p className="text-xs mt-1">Create a ticket if you need help</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
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
                    <MessageCircle className="w-3 h-3" /> {ticket.messagesCount}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
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
