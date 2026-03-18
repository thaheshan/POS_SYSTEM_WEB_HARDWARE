'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import FormInput from './form-input';
import AuthHeader from './auth-header';

export default function LoginForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('admin@abchardware.lk');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsLoading(false);
      console.log('Login attempted with:', { email, password, rememberMe });
    }, 1500);
  };

  return (
    <div className="w-full">
      <AuthHeader
        title="Welcome Back"
        subtitle="Sign in to your shop account"
      />

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          label="Email Address"
          type="email"
          icon="email"
          placeholder="admin@abchardware.lk"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <FormInput
          label="Password"
          type="password"
          icon="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showPasswordToggle
          isPasswordVisible={isPasswordVisible}
          onPasswordToggle={() => setIsPasswordVisible(!isPasswordVisible)}
          required
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700">Remember me</span>
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors duration-200 mt-6"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">OR</span>
        </div>
      </div>

      {/* Sign Up Link */}
      <div className="text-center">
        <p className="text-gray-700">
          Don't Have an Account?{' '}
          <Link
            href="/auth/register/role"
            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}
