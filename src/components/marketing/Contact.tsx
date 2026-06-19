import { Button } from "@/components/marketing/ui/button";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

const contactMethods = [
  {
    icon: Phone,
    title: "Call us",
    description: "Speak with our team for sales, onboarding, or product help.",
    value: "+91 771 234 5678",
    href: "#",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "Reach us for quick responses and demo scheduling.",
    value: "Chat on WhatsApp",
    href: "#",
  },
  {
    icon: Mail,
    title: "Email",
    description: "Send detailed questions or request a tailored quote.",
    value: "support@posstore.in",
    href: "#",
  },
  {
    icon: MapPin,
    title: "Visit us",
    description: "Meet our team in person for guided product walkthroughs.",
    value: "Open in Maps",
    href: "#",
  },
];

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-24 py-20 md:py-28 bg-[#f5fbf8]">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
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

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {contactMethods.map((method) => {
              const Icon = method.icon;

              return (
                <article
                  key={method.title}
                  className="group rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#059669] transition-colors group-hover:bg-[#059669] group-hover:text-white">
                    <Icon size={22} strokeWidth={2.2} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {method.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
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
        </div>
      </div>
    </section>
  );
}
