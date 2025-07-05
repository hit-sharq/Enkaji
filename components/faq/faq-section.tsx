import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    id: "shipping",
    question: "How long does shipping take?",
    answer:
      "Shipping times vary by location. Within Kenya, orders typically arrive within 3-5 business days. International shipping takes 7-14 business days depending on your location and chosen shipping method.",
  },
  {
    id: "authenticity",
    question: "Are all products authentic Masai crafts?",
    answer:
      "Yes, absolutely! Every product on Enkaji is handmade by verified Masai artisans using traditional techniques and materials. We work directly with artisan communities to ensure authenticity and fair compensation.",
  },
  {
    id: "returns",
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy for unused items in their original condition. Due to the handmade nature of our products, slight variations are normal and not grounds for return. Contact us at support@enkaji.com to initiate a return.",
  },
  {
    id: "payments",
    question: "What payment methods do you accept?",
    answer:
      "We accept major credit cards (Visa, Mastercard, American Express) through Stripe for international customers. Kenyan customers can also pay using M-Pesa for convenient local transactions.",
  },
  {
    id: "artisan-support",
    question: "How does purchasing support artisans?",
    answer:
      "When you purchase from Enkaji, a significant portion goes directly to the artisan who created the piece. We ensure fair pricing and provide artisans with a platform to reach global markets while preserving their traditional crafts.",
  },
  {
    id: "custom-orders",
    question: "Can I request custom pieces?",
    answer:
      "Yes! Many of our artisans accept custom orders. Contact the artisan directly through their profile page or reach out to us at hello@enkaji.com with your requirements, and we'll connect you with the right artisan.",
  },
  {
    id: "care-instructions",
    question: "How do I care for my handmade items?",
    answer:
      "Care instructions vary by product type and materials used. Each product page includes specific care instructions. Generally, we recommend gentle cleaning and avoiding harsh chemicals to preserve the natural materials and craftsmanship.",
  },
  {
    id: "wholesale",
    question: "Do you offer wholesale pricing?",
    answer:
      "Yes, we offer wholesale pricing for bulk orders. Please contact us at wholesale@enkaji.com with details about your requirements, and we'll provide you with wholesale pricing and terms.",
  },
  {
    id: "become-artisan",
    question: "How can I become an artisan on Enkaji?",
    answer:
      "We're always looking to work with talented Masai artisans! Apply through our artisan registration page. Our team will review your application and craftsmanship samples. Once approved, you can start listing your products on our platform.",
  },
  {
    id: "tracking",
    question: "How can I track my order?",
    answer:
      "Once your order ships, you'll receive a tracking number via email. You can also track your order status by logging into your account and viewing your order history.",
  },
]

export function FAQSection() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger className="text-left font-semibold">{faq.question}</AccordionTrigger>
          <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
