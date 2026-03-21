'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How long is the setup process?',
    answer:
      'Setup typically takes 2-3 hours with our guided onboarding. Our support team will assist you throughout the process to ensure everything is configured correctly.',
  },
  {
    question: 'What payment methods are supported?',
    answer:
      'We support Cash, Credit/Debit Cards, Mobile Money (FnM, eZ Cash, genie), Bank Transfers, Cheques, and Credit Sales with full payment reconciliation.',
  },
  {
    question: 'Can I integrate with my existing systems?',
    answer:
      'Yes, we provide API integration with accounting software, e-commerce platforms, and other business tools. Custom integrations are available.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'We use bank-level encryption (SSL/TLS), regular security audits, automatic backups, and comply with international data protection standards.',
  },
  {
    question: 'What if I need more than one location?',
    answer:
      'All Professional and Enterprise plans support multiple locations with centralized management and real-time synchronization.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 md:py-28" style={{ backgroundColor: '#e8f5ee' }}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Frequently Asked Questions
          </h2>
        </div>

        {/* FAQ Cards — collapsible display */}
        <div className="max-w-2xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl px-7 py-6 shadow-sm border border-gray-100 cursor-pointer transition-all duration-300 hover:shadow-md"
              onClick={() => toggleFaq(index)}
            >
              <div className="flex justify-between items-center gap-4">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {faq.question}
                </h3>
                <ChevronDown
                  size={18}
                  className={`text-gray-500 transition-transform duration-300 flex-shrink-0 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </div>
              <div
                className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out ${
                  openIndex === index
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0 mt-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
