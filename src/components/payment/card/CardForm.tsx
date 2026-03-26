import React from "react";
import { CreditCard, User, Calendar, Lock } from "lucide-react";

interface CardFormProps {
  cardNumber: string;
  setCardNumber: (val: string) => void;
  cardName: string;
  setCardName: (val: string) => void;
  expiry: string;
  setExpiry: (val: string) => void;
  cvv: string;
  setCvv: (val: string) => void;
}

export default function CardForm({
  cardNumber,
  setCardNumber,
  cardName,
  setCardName,
  expiry,
  setExpiry,
  cvv,
  setCvv,
}: CardFormProps) {
  return (
    <div>
      <h3 className="text-base font-bold text-slate-900 mb-4 tracking-tight">
        Card Information
      </h3>

      <div className="space-y-4">
        {/* Card Number */}
        <div className="relative">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Card Number <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <CreditCard className="absolute left-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="1234 5678 9012 3456"
              inputMode="numeric"
              autoComplete="cc-number"
              className="w-full h-12 pl-11 pr-16 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
              required
            />
            <div className="absolute right-3 bg-slate-200 px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold text-slate-600">
              VISA
            </div>
          </div>
        </div>

        {/* Card Name */}
        <div className="relative">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Cardholder Name <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value.toUpperCase())}
              placeholder="JOHN SILVA"
              autoComplete="cc-name"
              className="w-full h-12 pl-11 pr-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-900 uppercase"
              required
            />
          </div>
        </div>

        {/* Expiry and CVV Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Calendar className="absolute left-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                inputMode="numeric"
                autoComplete="cc-exp"
                className="w-full h-12 pl-11 pr-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              CVV <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
                maxLength={3}
                inputMode="numeric"
                autoComplete="cc-csc"
                className="w-full h-12 pl-11 pr-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-900 tracking-widest"
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
