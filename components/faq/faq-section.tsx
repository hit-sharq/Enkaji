import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    id: "what-is-enkaji",
    question: "What is Enkaji?",
    answer:
      "Enkaji is Kenya's premier B2B marketplace, connecting buyers with verified sellers and suppliers across all 47 counties. Whether you're sourcing for a small business or a large enterprise, Enkaji provides a trusted environment for secure trade across categories like agriculture, electronics, construction, and fashion.",
  },
  {
    id: "verified-sellers",
    question: "Are sellers on Enkaji verified?",
    answer:
      "Yes. Every seller and supplier goes through our verification process before they can trade on the platform. Verified sellers display a badge on their profile, helping you buy with confidence from businesses across Kenya.",
  },
  {
    id: "payments",
    question: "What payment methods do you accept?",
    answer:
      "We accept M-Pesa, bank transfers, and major credit and debit cards. Local payments are optimized for M-Pesa, while international transactions are supported through our secure card payment partners.",
  },
  {
    id: "buyer-protection",
    question: "How are my payments protected?",
    answer:
      "Enkaji offers trade assurance with escrow-style payment protection. Funds are safeguarded until your order is confirmed, so both buyers and sellers are protected throughout the transaction.",
  },
  {
    id: "rfq",
    question: "Can I request quotes from multiple sellers?",
    answer:
      "Yes. Use our Request for Quote (RFQ) feature to describe what you need and receive competitive quotes from relevant sellers across Kenya, typically within 24-48 hours.",
  },
  {
    id: "bulk-orders",
    question: "Do you support bulk and wholesale orders?",
    answer:
      "Absolutely. Many sellers offer wholesale pricing for bulk orders. Submit a bulk order request on the product page and the seller will contact you with a detailed quote and delivery timeline, usually within 24 hours.",
  },
  {
    id: "shipping",
    question: "How does shipping and delivery work?",
    answer:
      "Sellers ship their own products and we partner with local courier services for reliable delivery across Kenya. Nairobi orders typically arrive within 1-2 business days, while upcountry deliveries take 3-7 business days depending on location.",
  },
  {
    id: "returns",
    question: "What is your return and refund policy?",
    answer:
      "You can request a return within the window shown at checkout, generally up to 30 days from delivery for eligible items. Contact the seller first, and if they're unresponsive, reach out to Enkaji support through our Contact page to resolve the issue.",
  },
  {
    id: "become-seller",
    question: "How can I become a seller on Enkaji?",
    answer:
      "Create an account, open your dashboard, and select 'Become a Seller'. Provide your business details for verification, and once approved you can start listing products and reaching buyers nationwide.",
  },
  {
    id: "tracking",
    question: "How can I track my order?",
    answer:
      "Once your order ships, you'll receive a tracking update by email. You can also view your order status and history anytime by logging into your account.",
  },
]

export function FAQSection() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger className="text-left font-semibold">{faq.question}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
