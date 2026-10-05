import { useRouterState } from "@tanstack/react-router";

const WA_NUMBER = "919090204008";

const PAGE_MESSAGES: Record<string, string> = {
  "/": "Hi RASA! I'm interested in your Hookah Flavours. Could you share more details?",
  "/collections/majlis": "Hi RASA! I'm interested in the Majlis collection. Could you share more details?",
  "/collections/makhmal": "Hi RASA! I'm interested in the Makhmal collection. Could you share more details?",
  "/collections/tarkib": "Hi RASA! I'm interested in the Tarkib collection. Could you share more details?",
  "/collections": "Hi RASA! I'm interested in your collections. Could you share more details?",
  "/flavours": "Hi RASA! I'm interested in your Hookah Flavours. Could you share more details about pricing and availability?",
  "/hookah": "Hi RASA! I'm interested in this product. Could you share more details?",
  "/accessories": "Hi RASA! I'm interested in this product. Could you share more details?",
  "/coming-soon": "Hi RASA! I'm interested in this product. Could you share more details?",
  "/partners": "Hi RASA! I'd like to discuss wholesale pricing and partnership opportunities.",
  "/contact": "Hi RASA! I'd like to speak with your team.",
  "/house-of-rasa": "Hi RASA! I'm interested in your Hookah Flavours. Could you share more details?",
  "/loyalty": "Hi RASA! I'd like to know more about the RASA Loyalty Program.",
};

const DEFAULT_MESSAGE = "Hi RASA! I'm interested in your Hookah Flavours. Could you share more details?";

export function WhatsAppFloat() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const message = PAGE_MESSAGES[pathname] ?? DEFAULT_MESSAGE;
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:scale-110 transition-transform duration-300"
      style={{ background: "#25D366" }}
    >
      <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.003 2.667C8.637 2.667 2.667 8.636 2.667 16c0 2.358.627 4.573 1.72 6.49L2.667 29.333l7.05-1.693A13.268 13.268 0 0 0 16.003 29.333c7.364 0 13.33-5.969 13.33-13.333S23.367 2.667 16.003 2.667Zm0 24A11.6 11.6 0 0 1 9.89 24.85l-.415-.248-4.184 1.005 1.04-4.072-.27-.43A11.587 11.587 0 0 1 4.4 16c0-6.397 5.205-11.6 11.603-11.6S27.603 9.603 27.603 16 22.4 27.6 16.003 27.6Zm6.362-8.683c-.349-.174-2.063-1.017-2.382-1.133-.32-.117-.552-.174-.785.174-.232.348-.901 1.133-1.104 1.366-.203.232-.406.261-.754.087-.349-.174-1.472-.542-2.803-1.729-1.036-.924-1.735-2.065-1.938-2.413-.203-.348-.022-.537.153-.71.157-.156.349-.406.523-.61.174-.203.232-.348.348-.58.116-.233.058-.436-.029-.61-.087-.174-.784-1.89-1.075-2.588-.283-.68-.57-.587-.784-.598l-.668-.012c-.232 0-.61.087-.928.436-.32.348-1.22 1.192-1.22 2.908s1.249 3.373 1.423 3.606c.174.232 2.458 3.752 5.956 5.26.832.36 1.482.574 1.988.735.835.265 1.595.228 2.196.138.67-.1 2.063-.843 2.354-1.657.29-.813.29-1.511.203-1.657-.086-.145-.319-.232-.668-.406Z"/>
      </svg>
    </a>
  );
}
