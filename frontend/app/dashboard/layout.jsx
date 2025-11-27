'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { removeCookie, getCookie } from '@/lib/cookies';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

const pageMeta = {
  '/dashboard': { title: 'Dashboard' },
  '/dashboard/payment': { title: 'Payment' },
  '/dashboard/analytics': { title: 'Analytics' },
  '/dashboard/cards': { title: 'Cards' },
  '/dashboard/history': { title: 'History' },
  '/dashboard/services': { title: 'Services' },
  '/dashboard/settings': { title: 'Settings' },
};

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  // Protect all dashboard routes
  useProtectedRoute();

  useEffect(() => {
    const userData = getCookie('userData');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  const activeMetaKey = Object.keys(pageMeta).find((key) => pathname.startsWith(key)) || '/dashboard';
  const { title } = pageMeta[activeMetaKey] || { title: 'Dashboard' };

  const handleLogout = () => {
    removeCookie('authToken');
    removeCookie('userData');
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-background text-text-primary overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Bar */}
        <TopBar user={user} title={title} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
