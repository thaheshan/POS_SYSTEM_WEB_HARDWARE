import React from 'react';
import { CheckCircle, Phone, Mail, MessageCircle, Video, Download } from 'lucide-react';
import { ContactSection } from './ContactSection';
import { FAQSection } from './FAQSection';
import { useRouter } from "next/navigation";

interface RequestApprovedProps {
  selectedPlan: string;
}

const nextSteps = [
  {
    number: 1,
    title: 'Our team reviews your request',
    description: 'Within 24-48 hours, we will verify your details and confirm your request is approved',
  },
  {
    number: 2,
    title: 'Demo & consultation (Optional)',
    description: 'Get a personalized walkthrough of the system and all your questions answered. You can reschedule this anytime.',
  },
  {
    number: 3,
    title: 'Approval confirmation',
    description: 'Once approved, you will receive final email instruction to activate your account and begin using the system',
  },
  {
    number: 4,
    title: 'Complete payment setup',
    description: 'Provide payment details and your account will be activated immediately. You can then complete the onboarding process.',
  },
];

const supportChannels = [
  {
    icon: <Phone className="w-6 h-6" />,
    title: 'Phone Support',
    contact: '+91 771 234 5678',
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: 'Email Support',
    contact: 'support@posstore.in',
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: 'WhatsApp',
    contact: '+91 771 234 5678',
  },
  {
    icon: <Video className="w-6 h-6" />,
    title: 'Schedule Demo',
    contact: 'Book a call with expert',
  },
];

const planFeatures = [
  '5 Checkout Terminals',
  'Customer Loyalty Program',
  'Cloud Data Backup',
  'Dedicated Account Manager',
  'Multi-Location Support',
  'Advanced Reports & Analytics',
  'Priority Email & Phone Support',
  'Real-time Inventory Tracking',
  'Staff Training Included',
  '24/7 Technical Support',
];

export const RequestApproved: React.FC<RequestApprovedProps> = ({ selectedPlan }) => {
  const router = useRouter();
  return (
    <div className="bg-white">
      {/* Success Hero */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-teal-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Request Approved!</h1>
          <p className="text-gray-600">
            Your subscription request has been successfully approved by our team
          </p>
        </div>

        {/* Success Message Box */}
        <div className="bg-teal-50 border-l-4 border-teal-600 rounded-lg p-4 mb-8">
          <p className="text-teal-800">
            <span className="font-semibold">You're all set!</span> Your {selectedPlan} Plan is ready to activate. Complete the payment setup to get started immediately.
          </p>
        </div>
      </div>

      {/* Approval Details */}
      <div className="max-w-4xl mx-auto px-4 py-8 mb-8">
        <div className="border-2 border-teal-600 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-teal-600" />
            <h2 className="text-xl font-bold text-gray-900">Approval Confirmation Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Company Name</p>
                <p className="font-semibold text-gray-900">Silvi Hardware Store</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Approval Date</p>
                <p className="font-semibold text-gray-900">18/01/2026</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Subscription</p>
                <p className="font-semibold text-gray-900">Rs. 9,999</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Selected Plan</p>
                <p className="font-semibold text-gray-900">{selectedPlan} Plan</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Request ID</p>
                <p className="font-semibold text-gray-900">REQ-2026-001234-SEC</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="max-w-4xl mx-auto px-4 py-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Next Steps to Complete Setup</h2>

        <div className="space-y-4">
          {nextSteps.map((step) => (
            <div key={step.number} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-teal-600 text-white font-semibold">
                  {step.number}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Features */}
      <div className="bg-teal-50 py-8 mb-8">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What You Get With {selectedPlan} Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {planFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <span className="text-gray-900">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-4xl mx-auto px-4 py-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => router.push("/auth/register/payment")} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
            Continue to Payment Setup →
          </button>
          <button className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 font-semibold py-3 px-8 rounded-lg transition-colors">
            Schedule Setup Demo
          </button>
        </div>

        {/* Download Documentation */}
        <div className="text-center mt-6">
          <button className="flex items-center gap-2 justify-center text-teal-600 hover:text-teal-700 font-medium">
            <Download className="w-4 h-4" />
            Download Documentation
          </button>
        </div>
      </div>

      {/* Confirmation Email */}
      <div className="bg-teal-50 py-8 mb-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Mail className="w-12 h-12 text-teal-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmation Email Sent</h3>
          <p className="text-gray-700">
            A confirmation email has been sent to <span className="font-semibold">mohsin@silviihardware.k</span>
          </p>
          <p className="text-sm text-gray-600 mt-2">Check your inbox (and spam folder) for important setup details and next actions</p>
          <button className="text-teal-600 hover:text-teal-700 font-medium mt-4">Resend email again</button>
        </div>
      </div>

      {/* Support Channels */}
      <div className="max-w-4xl mx-auto px-4 py-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Need Help? Get in Touch</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {supportChannels.map((channel, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-lg transition-shadow">
              <div className="flex justify-center text-teal-600 mb-3">{channel.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{channel.title}</h3>
              <p className="text-sm text-gray-600">{channel.contact}</p>
              <button className="mt-3 w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 rounded transition-colors">
                {channel.title === 'Schedule Demo' ? 'Book Now' : 'Contact'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <FAQSection />
        </div>
      </div>
    </div>
  );
};
