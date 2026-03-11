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
      <h3 className="text-base font-bold text-gray-900 mb-4 tracking-tight">
        Card Information
      </h3>

      <div className="space-y-4">
        {/* Card Number */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Card Number <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <CreditCard className="absolute left-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="1234 5678 9012 3456"
              className="w-full pl-11 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-medium text-gray-900"
              required
            />
            <div className="absolute right-3 bg-gray-200 px-2 py-0.5 rounded text-xs font-bold text-gray-600">
              VISA
            </div>
          </div>
        </div>

        {/* Card Name */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Cardholder Name <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value.toUpperCase())}
              placeholder="JOHN SILVA"
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-medium text-gray-900 uppercase"
              required
            />
          </div>
        </div>

        {/* Expiry and CVV Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Calendar className="absolute left-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-medium text-gray-900"
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              CVV <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
                maxLength={3}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-medium text-gray-900 tracking-widest"
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
