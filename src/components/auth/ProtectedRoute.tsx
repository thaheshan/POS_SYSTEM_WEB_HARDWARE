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

  const userRole = (user?.role || (user as any)?.user_role || (user as any)?.roleName || '').toLowerCase().trim();

  const isRoleAllowed = !allowedRoles || allowedRoles.some(r => {
    const target = r.toLowerCase().trim();
    if (userRole === target) return true;
    if (target === 'owner' && (userRole.includes('owner') || userRole.includes('admin'))) return true;
    if (target === 'admin' && (userRole.includes('admin') || userRole.includes('owner'))) return true;
    if (target === 'staff' && (userRole.includes('staff') || userRole.includes('cashier'))) return true;
    return false;
  });

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (allowedRoles && user && !isRoleAllowed) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, isRoleAllowed, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-blue-600 font-bold">
        Authenticating...
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (allowedRoles && user && !isRoleAllowed) return null;

  return <>{children}</>;
}
