import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
}

const defaultFAQs: FAQItem[] = [
  {
    question: 'How long does the approval process take?',
    answer:
      'Typically 24-48 hours. Our team reviews your request and contacts you to schedule a demo. You can proceed immediately after approval.',
  },
  {
    question: 'Do I need to complete the demo before payment?',
    answer:
      'No, it is optional. You can schedule a demo anytime, but you still need to provide payment information once approved by our team.',
  },
  {
    question: "What happens after I click 'I'm Ready to Proceed'?",
    answer:
      "Once our team approves your request usually within 24-48 hours, you'll receive an email with payment setup instructions. You can complete the payment process.",
  },
  {
    question: 'Can I change my plan after approval?',
    answer:
      'Yes, absolutely. You can upgrade or downgrade your plan anytime from your account dashboard. Changes take effect the next billing cycle.',
  },
  {
    question: 'Is there a refund policy?',
    answer:
      'We offer a 14-day money-back guarantee if you are not satisfied. For questions asked, simply contact our support team.',
  },
];

export const FAQSection: React.FC<FAQSectionProps> = ({ title = 'Frequently Asked Questions' }) => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section className="mt-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>

      <div className="space-y-3">
        {defaultFAQs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
          >
            <button
              onClick={() => setExpanded(expanded === index ? null : index)}
              className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left"
            >
              <span className="font-medium text-gray-900">{faq.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform ${expanded === index ? 'rotate-180' : ''}`}
              />
            </button>

            {expanded === index && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-700 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
