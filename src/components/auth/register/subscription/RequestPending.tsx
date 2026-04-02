import React, { useEffect, useState } from 'react';
import { AlertCircle, Phone, Mail, MessageCircle, Video, MessageSquare, MapPin, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { ContactSection } from './ContactSection';
import { FAQSection } from './FAQSection';

interface RequestPendingProps {
  selectedPlan: string;
  onApproved: () => void;
  autoNavigateDelay?: number;
}

const demoOptions = [
  {
    icon: <Video className="w-6 h-6" />,
    title: 'Live Video Demo',
    description: 'One-on-one video',
    duration: '30 minutes demo',
  },
  {
    icon: <CheckCircle2 className="w-6 h-6" />,
    title: 'Complete Training',
    description: 'Comprehensive staff training',
    duration: '2-3 sessions',
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Onboarding Support',
    description: 'Dedicated specialist',
    duration: '1-2 weeks dedicated support',
  },
];

export const RequestPending: React.FC<RequestPendingProps> = ({
  selectedPlan,
  onApproved,
  autoNavigateDelay = 300000, // 5 minutes default
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showAutoNotification, setShowAutoNotification] = useState(false);

  useEffect(() => {
    // Simulate random delay between 5-10 minutes
    const randomDelay = Math.random() * (600000 - 300000) + 300000; // 5-10 minutes in ms
    console.log('[v0] Auto-navigate scheduled for:', randomDelay / 1000 / 60, 'minutes');

    const timer = setTimeout(() => {
      setShowAutoNotification(true);
      setTimeRemaining(5); // Show 5 second countdown before navigation
    }, randomDelay);

    const countdownInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          onApproved();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [onApproved]);

  return (
    <div className="bg-white">
      {/* Header Alert */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">Your Request is Pending Approval</h3>
            <p className="text-sm text-yellow-800 mt-1">
              Thank you for selecting the Professional Plan. Our team will review your request and contact you shortly to schedule a demo and provide guidance.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Request Summary */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Request Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Information */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-teal-600 font-bold">●</span>
                  <div>
                    <p className="font-medium text-gray-700">Shop Location Name</p>
                    <p className="text-gray-600">Silvi Hardware Store</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-teal-600 font-bold">●</span>
                  <div>
                    <p className="font-medium text-gray-700">Registration Number</p>
                    <p className="text-gray-600">BRN 2024-00234</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-teal-600 font-bold">●</span>
                  <div>
                    <p className="font-medium text-gray-700">Email Address</p>
                    <p className="text-gray-600">mohsin@silviihardware.k</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-teal-600 font-bold">●</span>
                  <div>
                    <p className="font-medium text-gray-700">Phone Number</p>
                    <p className="text-gray-600">+91 771 123 4567</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Plan */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Selected Plan</h3>
              <div className="border-2 border-teal-500 rounded-lg p-4 bg-teal-50">
                <h4 className="font-bold text-teal-700 mb-2">{selectedPlan} Plan</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ 2 Checkout Terminals</li>
                  <li>✓ Advanced Inventory Management</li>
                  <li>✓ Multi-Location Support</li>
                  <li>✓ Real-time Inventory Tracking</li>
                </ul>
                <p className="text-teal-600 font-semibold mt-4">Rs. 9,999 per month</p>
              </div>

              {/* Request ID */}
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Request ID</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value="REQ-2026-001234"
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                  />
                  <button className="text-gray-500 hover:text-gray-700">📋</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Request Status */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Request Status</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Request Received</p>
                <p className="text-sm text-gray-600">Your request has been submitted</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Team Review In Progress</p>
                <p className="text-sm text-gray-600">Typically 24-48 hours</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Demo Scheduled</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>
        </section>

        {/* Available Demo Options */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available Demo Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demoOptions.map((option, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 text-center">
                <div className="flex justify-center mb-3 text-teal-600">{option.icon}</div>
                <h4 className="font-semibold text-gray-900 mb-1">{option.title}</h4>
                <p className="text-xs text-gray-600 mb-2">{option.description}</p>
                <p className="text-xs font-medium text-teal-600">{option.duration}</p>
              </div>
            ))}
          </div>
        </section>
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

      {/* Auto Navigation Notification */}
      {showAutoNotification && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white rounded-lg shadow-lg p-4 animate-pulse">
          <p className="font-semibold mb-2">Request Approved! 🎉</p>
          <p className="text-sm">Redirecting in {timeRemaining} seconds...</p>
        </div>
      )}
    </div>
  );
};
