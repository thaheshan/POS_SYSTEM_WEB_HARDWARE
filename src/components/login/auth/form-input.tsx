import React, { InputHTMLAttributes } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: 'email' | 'password';
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
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const getIcon = () => {
      if (icon === 'email') {
        return <Mail className="w-5 h-5 text-gray-400" />;
      }
      if (icon === 'password') {
        return <Lock className="w-5 h-5 text-gray-400" />;
      }
      return null;
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {getIcon()}
            </div>
          )}
          <input
            ref={ref}
            type={
              showPasswordToggle && isPasswordVisible ? 'text' : type
            }
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              'w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 transition-all duration-200',
              'focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600',
              icon && 'pl-10',
              isFocused && 'border-blue-600 ring-1 ring-blue-600',
              error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
              className
            )}
            {...props}
          />
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={onPasswordToggle}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isPasswordVisible ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
