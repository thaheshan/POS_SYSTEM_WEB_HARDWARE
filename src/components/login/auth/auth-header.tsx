import React from "react";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-2.5 sm:gap-3.5 mb-6 sm:mb-8">
      {/* Store Icon */}
      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-md">
        <svg
          className="w-6 h-6 sm:w-7 sm:h-7 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M7 4V2h10v2h4v2H4V4h3zm0 6h10v10H7V10zm2 2v6h6v-6H9z" />
        </svg>
      </div>

      {/* Title */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center leading-tight">
        {title}
      </h1>

      {/* Subtitle */}
      <p className="text-gray-600 text-center text-xs sm:text-sm leading-relaxed max-w-md px-2 sm:px-0">
        {subtitle}
      </p>
    </div>
  );
}
