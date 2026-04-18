import React, { useState, useEffect } from "react";
import { CreditCard, User, Calendar, Lock, AlertCircle } from "lucide-react";

// Format card number with spaces: 1234 5678 9012 3456
const formatCardNumber = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
};

// Luhn algorithm to validate credit card number
const luhnCheck = (num: string): boolean => {
  const digits = num.replace(/\D/g, "");
  if (digits.length !== 16) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Format expiry date as MM/YY
const formatExpiry = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

// Check if card is expired
const isCardExpired = (expiry: string): boolean => {
  const [month, year] = expiry.split("/");
  if (!month || !year) return false;

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Last 2 digits
  const currentMonth = currentDate.getMonth() + 1;

  const expiryYear = parseInt(year, 10);
  const expiryMonth = parseInt(month, 10);

  if (expiryYear < currentYear) return true;
  if (expiryYear === currentYear && expiryMonth < currentMonth) return true;

  return false;
};

interface CardFormProps {
  cardNumber: string;
  setCardNumber: (val: string) => void;
  cardName: string;
  setCardName: (val: string) => void;
  expiry: string;
  setExpiry: (val: string) => void;
  cvv: string;
  setCvv: (val: string) => void;
  onValidationChange?: (isValid: boolean) => void;
}

interface ValidationErrors {
  cardNumber?: string;
  cardName?: string;
  expiry?: string;
  cvv?: string;
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
  onValidationChange,
}: CardFormProps) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState({
    cardNumber: false,
    cardName: false,
    expiry: false,
    cvv: false,
  });

  // Validate all fields
  const validateFields = () => {
    const newErrors: ValidationErrors = {};

    // Card Number validation
    const cardDigits = cardNumber.replace(/\D/g, "");
    if (!cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required";
    } else if (cardDigits.length !== 16) {
      newErrors.cardNumber = "Card number must be 16 digits";
    } else if (!luhnCheck(cardNumber)) {
      newErrors.cardNumber = "Invalid card number";
    }

    // Card Name validation
    if (!cardName.trim()) {
      newErrors.cardName = "Cardholder name is required";
    } else if (!/^[A-Z\s]+$/.test(cardName)) {
      newErrors.cardName = "Name must contain only letters and spaces";
    } else if (cardName.trim().length < 3) {
      newErrors.cardName = "Name must be at least 3 characters";
    }

    // Expiry Date validation
    if (!expiry.trim()) {
      newErrors.expiry = "Expiry date is required";
    } else if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      newErrors.expiry = "Format must be MM/YY";
    } else if (isCardExpired(expiry)) {
      newErrors.expiry = "Card has expired";
    }

    // CVV validation
    if (!cvv.trim()) {
      newErrors.cvv = "CVV is required";
    } else if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = "CVV must be 3 or 4 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Expose validation to parent via callback
  useEffect(() => {
    const isValid =
      Object.keys(errors).length === 0 &&
      cardNumber.trim() &&
      cardName.trim() &&
      expiry.trim() &&
      cvv.trim();
    onValidationChange?.(isValid);
  }, [errors, cardNumber, cardName, expiry, cvv, onValidationChange]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    if (touched.cardNumber) {
      const cardDigits = formatted.replace(/\D/g, "");
      if (formatted && cardDigits.length === 16) {
        const newErrors = { ...errors };
        if (luhnCheck(formatted)) {
          delete newErrors.cardNumber;
        }
        setErrors(newErrors);
      }
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setExpiry(formatted);
    if (touched.expiry && formatted) {
      const newErrors = { ...errors };
      if (/^\d{2}\/\d{2}$/.test(formatted) && !isCardExpired(formatted)) {
        delete newErrors.expiry;
      }
      setErrors(newErrors);
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched({ ...touched, [field]: true });
    validateFields();
  };

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
              onChange={handleCardNumberChange}
              onBlur={() => handleBlur("cardNumber")}
              placeholder="1234 5678 9012 3456"
              inputMode="numeric"
              autoComplete="cc-number"
              maxLength={19}
              className={`w-full h-12 pl-11 pr-16 border rounded-lg focus:ring-2 focus:border-500 outline-none transition-all font-medium text-slate-900 ${
                touched.cardNumber && errors.cardNumber
                  ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                  : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              required
            />
            <div className="absolute right-3 bg-slate-200 px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold text-slate-600">
              VISA
            </div>
          </div>
          {touched.cardNumber && errors.cardNumber && (
            <div className="flex items-center gap-1 mt-1.5 text-red-500 text-xs">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.cardNumber}</span>
            </div>
          )}
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
              onBlur={() => handleBlur("cardName")}
              placeholder="JOHN SILVA"
              autoComplete="cc-name"
              className={`w-full h-12 pl-11 pr-4 border rounded-lg focus:ring-2 focus:border-500 outline-none transition-all font-medium text-slate-900 uppercase ${
                touched.cardName && errors.cardName
                  ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                  : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              required
            />
          </div>
          {touched.cardName && errors.cardName && (
            <div className="flex items-center gap-1 mt-1.5 text-red-500 text-xs">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.cardName}</span>
            </div>
          )}
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
                onChange={handleExpiryChange}
                onBlur={() => handleBlur("expiry")}
                placeholder="MM/YY"
                inputMode="numeric"
                autoComplete="cc-exp"
                maxLength={5}
                className={`w-full h-12 pl-11 pr-4 border rounded-lg focus:ring-2 focus:border-500 outline-none transition-all font-medium text-slate-900 ${
                  touched.expiry && errors.expiry
                    ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                    : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
                required
              />
            </div>
            {touched.expiry && errors.expiry && (
              <div className="flex items-center gap-1 mt-1.5 text-red-500 text-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.expiry}</span>
              </div>
            )}
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
                onChange={(e) =>
                  setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                onBlur={() => handleBlur("cvv")}
                placeholder="123"
                maxLength={4}
                inputMode="numeric"
                autoComplete="cc-csc"
                className={`w-full h-12 pl-11 pr-4 border rounded-lg focus:ring-2 focus:border-500 outline-none transition-all font-medium text-slate-900 tracking-widest ${
                  touched.cvv && errors.cvv
                    ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                    : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
                required
              />
            </div>
            {touched.cvv && errors.cvv && (
              <div className="flex items-center gap-1 mt-1.5 text-red-500 text-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.cvv}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
