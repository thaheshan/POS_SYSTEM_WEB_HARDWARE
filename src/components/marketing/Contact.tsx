import { Button } from "@/components/marketing/ui/button";
import { Mail, MapPin, MessageCircle, Phone, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import api from "@/api/axiosInstance";
import { toast } from "react-hot-toast";

const contactMethods = [
  {
    icon: Phone,
    title: "Call us",
    description: "Speak with our team for sales, onboarding, or product help.",
    value: "+94 75 664 5486",
    href: "tel:+94756645486",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "Reach us for quick responses and demo scheduling.",
    value: "Chat on WhatsApp",
    href: "https://wa.me/94756645486",
  },
  {
    icon: Mail,
    title: "Email",
    description: "Send detailed questions or request a tailored quote.",
    value: "admin@futurasolutions.tech",
    href: "mailto:admin@futurasolutions.tech",
  },
  {
    icon: MapPin,
    title: "Visit us",
    description: "Meet our team in person for guided product walkthroughs.",
    value: "no 5, wijayaba mawatha, kalubowila colombo",
    href: "#",
  },
];

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/contact", formData);
      toast.success("Message sent successfully! We will get back to you soon.");
      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
    } catch (error) {
      console.error("Failed to submit contact message", error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="scroll-mt-24 py-20 md:py-28 bg-[#f5fbf8]">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-14">
            <p className="font-semibold tracking-[0.28em] text-xs uppercase mb-3 text-[#059669]">
              Contact
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Talk to the team behind the platform
            </h2>
            <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Need a demo, pricing guidance, or setup support? Reach out using
              the channel that fits your workflow best.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-2 items-start">
            {/* Left Side: Contact Cards */}
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
              {contactMethods.map((method) => {
                const Icon = method.icon;

                return (
                  <article
                    key={method.title}
                    className="group rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col h-full"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#059669] transition-colors group-hover:bg-[#059669] group-hover:text-white">
                      <Icon size={22} strokeWidth={2.2} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {method.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500 flex-grow">
                      {method.description}
                    </p>
                    <a
                      href={method.href}
                      target={
                        method.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        method.href.startsWith("http") ? "noreferrer" : undefined
                      }
                      className="mt-5 inline-flex text-sm font-semibold text-[#059669] transition-colors hover:text-[#047857]"
                    >
                      {method.value}
                    </a>
                  </article>
                );
              })}
            </div>

            {/* Right Side: Contact Form */}
            <div className="bg-white rounded-2xl border border-emerald-100 p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#059669] focus:ring-1 focus:ring-[#059669] bg-gray-50/50"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#059669] focus:ring-1 focus:ring-[#059669] bg-gray-50/50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 123 456 7890"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#059669] focus:ring-1 focus:ring-[#059669] bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="company" className="text-sm font-semibold text-gray-700">Company</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your Company"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#059669] focus:ring-1 focus:ring-[#059669] bg-gray-50/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-sm font-semibold text-gray-700">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="How can we help you?"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#059669] focus:ring-1 focus:ring-[#059669] bg-gray-50/50 resize-y"
                    required
                  ></textarea>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-6 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-base transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
