import React from 'react';
import { Phone, MessageCircle, Mail, Video, MessageSquare, MapPin } from 'lucide-react';

interface ContactOption {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  contact?: string;
}

const contactOptions: ContactOption[] = [
  {
    icon: <Phone className="w-6 h-6" />,
    title: 'Phone Call',
    description: 'Speak directly with our team. Available Monday to Friday, 9 AM to 6 PM.',
    buttonText: 'Call Now',
    contact: '+91 771 234 5678',
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: 'WhatsApp',
    description: 'Quick chat support with instant responses. Available 24/7 for quick queries.',
    buttonText: 'Message on WhatsApp',
    contact: '+91 771 234 5678',
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: 'Email Support',
    description: 'Detailed inquiries handled by our support team. Response within 24 hours.',
    buttonText: 'Send Email',
    contact: 'support@posstore.in',
  },
  {
    icon: <Video className="w-6 h-6" />,
    title: 'Schedule Demo',
    description: 'Book a video call with our product expert for personalized demo and guidance.',
    buttonText: 'Schedule Demo',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Live Chat',
    description: 'Real-time chat support from our team. Perfect way to get instant answers.',
    buttonText: 'Open Chat',
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: 'Visit Office',
    description: 'Visit our office in-person meeting and detailed product walkthrough.',
    buttonText: 'Get Directions',
  },
];

export const ContactSection: React.FC = () => {
  return (
    <section className="mt-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Get in Touch with Our Team</h2>
      <p className="text-gray-600 mb-6">
        Our team is ready to help you with setup, demo, and guidance. Choose your preferred contact method
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contactOptions.map((option, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="text-teal-600">{option.icon}</div>
            </div>
            <h3 className="text-center font-semibold text-gray-900 mb-2">{option.title}</h3>
            <p className="text-center text-sm text-gray-600 mb-4">{option.description}</p>
            {option.contact && <p className="text-center text-sm font-medium text-teal-600 mb-4">{option.contact}</p>}
            <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              {option.buttonText}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
