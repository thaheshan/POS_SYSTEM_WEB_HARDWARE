import React, { InputHTMLAttributes } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: "email" | "password";
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onPasswordToggle?: () => void;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      icon,
      showPasswordToggle = false,
      isPasswordVisible = false,
      onPasswordToggle,
      className,
      type = "text",
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const getIcon = () => {
      if (icon === "email") {
        return <Mail className="w-4 h-4 text-gray-500" />;
      }
      if (icon === "password") {
        return <Lock className="w-4 h-4 text-gray-500" />;
      }
      return null;
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
              {getIcon()}
            </div>
          )}
          <input
            ref={ref}
            type={showPasswordToggle && isPasswordVisible ? "text" : type}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 transition-all duration-200 sm:text-base sm:py-3",
              "focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0",
              "hover:border-gray-400",
              icon && "pl-10 sm:pl-11",
              error && "border-red-500 focus:ring-red-500 focus:border-red-500",
              className,
            )}
            {...props}
          />
          {showPasswordToggle && type === "password" && (
            <button
              type="button"
              onClick={onPasswordToggle}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 transition-colors duration-200 hover:text-gray-700"
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            >
              {isPasswordVisible ? (
                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm font-medium text-red-600">{error}</p>
        )}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";

export default FormInput;