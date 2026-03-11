import React from 'react';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-3 mb-8">
      {/* Store Icon */}
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
        <svg
          className="w-8 h-8 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M7 4V2h10v2h4v2H4V4h3zm0 6h10v10H7V10zm2 2v6h6v-6H9z" />
        </svg>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 text-center text-balance">
        {title}
      </h1>

      {/* Subtitle */}
      <p className="text-gray-600 text-center">{subtitle}</p>
    </div>
  );
}
