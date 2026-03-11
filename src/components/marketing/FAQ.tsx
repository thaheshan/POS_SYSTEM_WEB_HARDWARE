'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/marketing/ui/accordion';

const faqs = [
  {
    question: 'How long does the installation process take?',
    answer:
      'Our standard installation takes 1-3 days depending on your store size and current systems. We also provide full training to your staff during this time.',
  },
  {
    question: 'Can I migrate my existing data from another POS system?',
    answer:
      'Yes! We support data migration from all major POS systems. Our technical team will handle the entire migration process to ensure zero data loss.',
  },
  {
    question: 'Is internet connection required to operate the POS?',
    answer:
      'Our system works in offline mode for basic transactions. When internet is available, it automatically syncs all data to the cloud. This ensures uninterrupted service.',
  },
  {
    question: 'What payment methods are supported?',
    answer:
      'We support all major payment methods including cards (Visa, Mastercard, Amex), digital wallets (Google Pay, Apple Pay), UPI, and cash payments.',
  },
  {
    question: 'How is my data secured and backed up?',
    answer:
      'Your data is encrypted in transit and at rest using bank-level AES-256 encryption. We perform automatic daily backups and maintain 99.9% uptime guarantee.',
  },
  {
    question: 'Do you offer discounts for annual plans?',
    answer:
      'Yes, we offer 20% discount on annual plans and additional discounts for multi-location setups. Contact our sales team for a custom quote.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-16 md:py-24 bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Find answers to common questions about our POS system
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-2 border-gray-200 rounded-lg px-6 data-[state=open]:border-teal-300 data-[state=open]:bg-teal-50"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-teal-600 py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
