'use client';

import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  const footerSections = [
    {
      title: 'About',
      links: ['About Us', 'Team', 'Careers', 'Blog']
    },
    {
      title: 'Product',
      links: ['Features', 'Pricing', 'Security', 'Roadmap']
    },
    {
      title: 'Support',
      links: ['Help Center', 'Documentation', 'Contact Us', 'Status Page']
    },
    {
      title: 'Legal',
      links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Compliance']
    }
  ];

  return (
    <footer className="bg-[#0b0f19] text-white py-16 px-10 mt-20">
      <div className="max-w-[1536px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pb-16 border-b border-white/10">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-[13px] font-black uppercase tracking-[0.2em] mb-6 text-white/50">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[14px] text-white/70 hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[13px] text-white/40 font-bold tracking-tight">
            © 2026 Hardware POS System by Futura Solutions PVT LTD. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-white/40 hover:text-white transition-colors"><Facebook size={20} /></a>
            <a href="#" className="text-white/40 hover:text-white transition-colors"><Twitter size={20} /></a>
            <a href="#" className="text-white/40 hover:text-white transition-colors"><Linkedin size={20} /></a>
            <a href="#" className="text-white/40 hover:text-white transition-colors"><Instagram size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
