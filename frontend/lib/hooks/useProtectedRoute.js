'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/lib/cookies';

/**
 * Hook to protect routes on the client side
 * Use this in any page that requires authentication
 * 
 * Example:
 * export default function DashboardPage() {
 *   useProtectedRoute();
 *   return <div>Dashboard content</div>
 * }
 */
export function useProtectedRoute() {
  const router = useRouter();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const token = getCookie('authToken');
    
    if (!token) {
      // No token, redirect to login
      router.push('/auth/login');
    }
  }, []);
}

/**
 * Hook to redirect authenticated users away from auth pages
 * Use this in login/register pages
 * 
 * Example:
 * export default function LoginPage() {
 *   useRedirectIfAuthenticated('/dashboard');
 *   return <div>Login form</div>
 * }
 */
export function useRedirectIfAuthenticated(redirectPath = '/dashboard') {
  const router = useRouter();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const token = getCookie('authToken');
    
    if (token) {
      // Already authenticated, redirect away
      router.push(redirectPath);
    }
  }, []);
}
