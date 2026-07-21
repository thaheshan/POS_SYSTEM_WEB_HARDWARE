import { Blocks, Link2, Zap } from 'lucide-react';

export default function IntegrationSettings() {
  const integrations = [
    { name: 'WhatsApp Business', desc: 'Send automated receipts and delivery updates via WhatsApp.', status: 'Connected', icon: 'WA', color: 'bg-green-500' },
    { name: 'Xero Accounting', desc: 'Sync daily sales, invoices, and expenses automatically.', status: 'Not Connected', icon: 'XO', color: 'bg-blue-400' },
    { name: 'Shopify', desc: 'Sync inventory levels between physical store and online shop.', status: 'Not Connected', icon: 'S', color: 'bg-emerald-500' },
    { name: 'Mailchimp', desc: 'Sync customer emails for marketing campaigns.', status: 'Connected', icon: 'MC', color: 'bg-yellow-400' },
  ];

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fdf2f8]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-pink-100 rounded-[12px] flex items-center justify-center border border-pink-200">
            <Blocks className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h2 className="text-[18px] font-black tracking-tight text-gray-900">Integrations & Add-ons</h2>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">
              Connect third-party logistics, accounting, and CRM applications
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((int, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-5 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-[14px] ${int.color}`}>
                  {int.icon}
                </div>
                {int.status === 'Connected' ? (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Connected
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-black uppercase">
                    Not Connected
                  </span>
                )}
              </div>
              <h4 className="text-[15px] font-black text-gray-900">{int.name}</h4>
              <p className="text-[12px] font-bold text-gray-500 mt-1 mb-6 flex-1">{int.desc}</p>
              
              {int.status === 'Connected' ? (
                <button className="text-[12px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg w-full hover:bg-gray-100 transition-colors">
                  Configure Settings
                </button>
              ) : (
                <button className="text-[12px] font-bold text-pink-600 bg-pink-50 border border-pink-100 px-4 py-2 rounded-lg w-full hover:bg-pink-100 transition-colors flex items-center justify-center gap-2">
                  <Link2 className="w-4 h-4" /> Connect App
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
