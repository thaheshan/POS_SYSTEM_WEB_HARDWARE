import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { ContactSection } from './ContactSection';
import { FAQSection } from './FAQSection';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  description: string;
  price: string;
  period: string;
  badge?: string;
  features: PlanFeature[];
  buttonText: string;
  isHighlighted: boolean;
}

interface SubscriptionSelectionProps {
  onSelectPlan: (planName: string) => void;
}

const plans: Plan[] = [
  {
    name: 'Starter',
    description: 'Perfect for single shop',
    price: 'Rs. 11,000',
    period: '/month',
    features: [
      { text: '1 Shop Location', included: true },
      { text: 'Unlimited Products', included: true },
      { text: '5 User Accounts', included: true },
      { text: 'POS System', included: true },
      { text: 'Inventory Management', included: true },
      { text: 'Basic Reports', included: true },
      { text: 'Email Support', included: true },
    ],
    buttonText: 'Select Starter Plan',
    isHighlighted: false,
  },
  {
    name: 'Professional',
    description: 'Best for growing businesses',
    price: 'Rs. 25,000',
    period: '/month',
    badge: 'MOST POPULAR',
    features: [
      { text: 'Up to 5 Shop Locations', included: true },
      { text: 'Unlimited Products & Categories', included: true },
      { text: '15 User Accounts', included: true },
      { text: 'Advanced POS with Multiple Terminals', included: true },
      { text: 'Advanced Inventory & Stock Transfer', included: true },
      { text: 'Advanced Reports & Analytics', included: true },
      { text: 'WhatsApp Integration', included: true },
      { text: 'Priority Phone & Email Support', included: true },
    ],
    buttonText: 'Start Free Trial',
    isHighlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'For large retail chains',
    price: 'Custom Pricing',
    period: '',
    features: [
      { text: 'Unlimited Locations', included: true },
      { text: 'Unlimited Users', included: true },
      { text: 'Custom Features Development', included: true },
      { text: 'Dedicated Account Manager', included: true },
      { text: '24/7 Priority Support', included: true },
      { text: 'On-premise Deployment Option', included: true },
    ],
    buttonText: 'Contact Sales',
    isHighlighted: false,
  },
];

const features = [
  { icon: '🔒', text: 'Secure Payment' },
  { icon: '↩️', text: '30-Day Money Back' },
  { icon: '📞', text: '24/7 Support' },
];

export const SubscriptionSelection: React.FC<SubscriptionSelectionProps> = ({ onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
    onSelectPlan(planName);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">Choose Your Plan</h1>
        <p className="text-center text-gray-600 mb-8">Start with 30 days free trial. Cancel anytime.</p>

        {/* Billing Toggle */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Yearly
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-lg overflow-hidden transition-all ${
                plan.isHighlighted
                  ? 'bg-blue-600 text-white shadow-2xl scale-105 md:scale-105'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="bg-orange-500 text-white text-xs font-bold px-4 py-1 text-center">
                  {plan.badge}
                </div>
              )}

              {/* Plan Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className={`text-sm mb-4 ${plan.isHighlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-3xl font-bold">{plan.price}</div>
                  {plan.period && (
                    <>
                      <span className={plan.isHighlighted ? 'text-blue-100' : 'text-gray-600'}>{plan.period}</span>
                      <div
                        className={`text-xs mt-2 ${
                          plan.isHighlighted ? 'text-blue-100' : 'text-blue-600'
                        }`}
                      >
                        30 days free trial + Premium support
                      </div>
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        plan.isHighlighted ? 'text-white' : 'text-teal-600'
                      }`} />
                      <span className="text-sm">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  onClick={() => handleSelectPlan(plan.name)}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                    plan.isHighlighted
                      ? 'bg-white text-blue-600 hover:bg-gray-100'
                      : 'border-2 border-teal-600 text-teal-600 hover:bg-teal-50'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex justify-center gap-8 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl mb-2">{feature.icon}</div>
              <p className="text-sm font-medium text-gray-700">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <ContactSection />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <FAQSection />
      </div>
    </div>
  );
};
