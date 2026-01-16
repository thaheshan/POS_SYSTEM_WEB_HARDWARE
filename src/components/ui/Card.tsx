'use client';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export default function Card({ title, children, className = '', headerAction }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-md ${className}`}>
      {title && (
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold">{title}</h3>
          {headerAction}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
