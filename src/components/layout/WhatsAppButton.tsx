import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "918000825980";

interface WhatsAppButtonProps {
  message?: string;
  className?: string;
}

export function WhatsAppButton({ 
  message = "Hi KarnaliX! I need help with...", 
  className = "" 
}: WhatsAppButtonProps) {
  const handleClick = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-20 right-4 md:bottom-6 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BD5C] text-white shadow-lg shadow-[#25D366]/30 flex items-center justify-center transition-all hover:scale-110 ${className}`}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-red rounded-full animate-pulse" />
    </button>
  );
}

// Quick action links for WhatsApp
export const whatsAppLinks = {
  login: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I need help logging into my KarnaliX account.")}`,
  deposit: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I want to deposit funds to my KarnaliX account.")}`,
  withdraw: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I want to withdraw funds from my KarnaliX account.")}`,
  play: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I want to play games on KarnaliX.")}`,
  support: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I need support with my KarnaliX account.")}`,
};
