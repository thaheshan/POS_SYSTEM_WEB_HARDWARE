'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-blue-600 font-bold">
        Authenticating...
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
