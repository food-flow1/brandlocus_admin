import React from 'react';
import Sidebar from '@/components/layouts/Sidebar';
import Navbar from '@/components/layouts/Navbar';
import { ToastProvider } from '@/components/Toast';
import AuthGuard from '@/components/AuthGuard';

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <ToastProvider>
        <div className="flex h-screen overflow-hidden bg-black">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-white">
            <Navbar />
            {/* Add padding-top to account for fixed navbar height */}
            <div className="py-4 sm:py-6 mt-[52px] sm:mt-[60px]">
              {children}
            </div>
          </main>
        </div>
      </ToastProvider>
    </AuthGuard>
  );
}

