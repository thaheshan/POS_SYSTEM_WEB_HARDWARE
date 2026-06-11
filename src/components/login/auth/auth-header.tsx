import React from "react";
import Link from "next/link";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-2.5 sm:gap-3.5 mb-6 sm:mb-8">

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