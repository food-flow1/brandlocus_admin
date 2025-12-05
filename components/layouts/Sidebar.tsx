'use client';

import React, { useState, useEffect, useRef, startTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useProfile, useLogout } from '@/hooks/useAuth';
import { ICONS } from '@/constants';
import { ROUTES } from '@/constants/routes';
import LogoutModal from '@/components/modals/LogoutModal';

const Sidebar = () => {
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);
  // Fetch user profile - endpoint is called automatically via useProfile hook
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: profileData } = useProfile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const logoutMutation = useLogout();

  // Profile data is fetched and available via profileData for future use

  // Close mobile menu on route change
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      startTransition(() => {
        setIsMobileMenuOpen(false);
      });
    }
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navigationItems = [
    {
      name: 'Dashboard',
      path: ROUTES.dashboard,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 10L10 2.5L17.5 10M2.5 17.5H7.5V11.25H12.5V17.5H17.5V10.8333L10 3.33333L2.5 10.8333V17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      badge: 5,
    },
    {
      name: 'Chat Log',
      path: ROUTES.chatLog,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.5 9.58333C17.5 13.4958 14.1625 16.6667 10 16.6667C9.1125 16.6667 8.27083 16.4958 7.5 16.1875L2.5 17.5L3.9375 12.7708C3.27083 11.7708 2.91667 10.7208 2.91667 9.58333C2.91667 5.67083 6.25417 2.5 10 2.5C13.7458 2.5 17.5 5.67083 17.5 9.58333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="7.5" cy="9.58333" r="0.833333" fill="currentColor" />
          <circle cx="10" cy="9.58333" r="0.833333" fill="currentColor" />
          <circle cx="12.5" cy="9.58333" r="0.833333" fill="currentColor" />
        </svg>
      ),
    },
    {
      name: 'Users',
      path: ROUTES.users,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 10C12.3012 10 14.1667 8.13452 14.1667 5.83333C14.1667 3.53215 12.3012 1.66667 10 1.66667C7.69881 1.66667 5.83333 3.53215 5.83333 5.83333C5.83333 8.13452 7.69881 10 10 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17.5 18.3333C17.5 15.1117 14.1421 12.5 10 12.5C5.85786 12.5 2.5 15.1117 2.5 18.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      name: 'Analytics',
      path: ROUTES.analytics,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 15.8333L8.33333 10L12.5 14.1667L17.5 9.16667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12.5 9.16667H17.5V14.1667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      name: 'Forms',
      path: ROUTES.forms,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.6667 17.5H3.33333C2.89131 17.5 2.46738 17.3244 2.15482 17.0118C1.84226 16.6993 1.66667 16.2754 1.66667 15.8333V4.16667C1.66667 3.72464 1.84226 3.30072 2.15482 2.98816C2.46738 2.67559 2.89131 2.5 3.33333 2.5H8.33333L10 4.16667H16.6667C17.1087 4.16667 17.5326 4.34226 17.8452 4.65482C18.1577 4.96738 18.3333 5.39131 18.3333 5.83333V15.8333C18.3333 16.2754 18.1577 16.6993 17.8452 17.0118C17.5326 17.3244 17.1087 17.5 16.6667 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.83333 8.33333H14.1667M5.83333 11.6667H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    // {
    //   name: 'Notifications',
    //   path: ROUTES.notifications,
    //   icon: (
    //     <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    //       <path d="M15 6.66667C15 5.34058 14.4732 4.06881 13.5355 3.13115C12.5979 2.19349 11.3261 1.66667 10 1.66667C8.67392 1.66667 7.40215 2.19349 6.46447 3.13115C5.52678 4.06881 5 5.34058 5 6.66667C5 12.5 2.5 14.1667 2.5 14.1667H17.5C17.5 14.1667 15 12.5 15 6.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    //       <path d="M11.4417 17.5C11.1435 17.7639 10.7656 17.9069 10.375 17.9069C9.98441 17.9069 9.60651 17.7639 9.30833 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    //     </svg>
    //   ),
    //   hasNotification: true,
    // },
  ];

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="mb-6 lg:mb-8 flex flex-col items-center gap-2">
        <div className="flex h-10 w-10 lg:h-14 lg:w-14 items-center justify-center">
          <Image
            src={ICONS.logo}
            alt="Brand Locus Logo"
            width={32}
            height={32}
            className="h-full w-full"
            priority
          />
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="mb-4">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-white">
            General
          </h2>
          <nav className="space-y-2 lg:space-y-3">
            {navigationItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 lg:py-2.5 text-sm font-normal transition-colors ${isActive
                    ? 'bg-[#313131] text-white'
                    : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                    }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="flex-1">{item.name}</span>
                  {/* {item.hasNotification && (
                    <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                  )} */}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section */}
      <div
        className="mt-auto flex items-center justify-between border-t border-gray-800 pt-4 cursor-pointer"
        onClick={() => setShowLogoutModal(true)}
      >
        <span className="text-xs lg:text-sm font-medium text-white">BRAND LOCUS</span>
        <button

          className="text-gray-400 transition-colors hover:text-white"
          aria-label="Logout"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L17.5 10M17.5 10L12.5 5M17.5 10H5.83333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2.5 2.5V17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white border border-gray-200 text-black shadow-lg"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-full flex-col bg-black px-4 py-6">
          {/* Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
          {sidebarContent}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-screen w-[280px] xl:w-[300px] flex-col bg-black px-4 py-6 shrink-0 sticky top-0">
        {sidebarContent}
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          logoutMutation.mutate();
          setShowLogoutModal(false);
        }}
        isLoading={logoutMutation.isPending}
      />
    </>
  );
};

export default Sidebar;