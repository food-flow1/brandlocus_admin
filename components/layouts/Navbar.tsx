'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useProfile, useLogout } from '@/hooks/useAuth';
import { PAGE_TITLES, DEFAULT_PAGE_TITLE } from '@/constants/navbar';
import { GrNotification } from 'react-icons/gr';
import LogoutModal from '@/components/modals/LogoutModal';

const Navbar = () => {
  const pathname = usePathname();
  const { data: profileData } = useProfile();
  const logoutMutation = useLogout();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Get page title based on current route
  const pageInfo = PAGE_TITLES[pathname] || DEFAULT_PAGE_TITLE;
  
  // Get user data from profile API
  const user = profileData?.data ? {
    name: profileData.data.email?.split('@')[0] || 'Admin',
    email: profileData.data.email || '',
    role: profileData.data.role || 'Admin',
  } : {
    name: 'Admin',
    email: '',
    role: 'Admin',
  };

  // Mock notification count - replace with actual API call
  const notificationCount = 0;

  return (
    <div className="fixed top-0 right-0 left-0 lg:left-[280px] xl:left-[300px] z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 py-3 sm:py-4">
      {/* Left Side - Page Title (with space for mobile menu button) */}
      <div className="flex flex-col pl-12 lg:pl-0">
        <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">{pageInfo.title}</h1>
        <p className="text-xs sm:text-sm text-gray-500 truncate hidden sm:block">{pageInfo.subtitle}</p>
      </div>

      {/* Right Side - Notifications & User Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex items-center justify-center rounded-lg p-1.5 sm:p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="Notifications"
          >
            <GrNotification className="w-4 h-4 sm:w-5 sm:h-5" />
            {notificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 sm:-right-1 sm:-top-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-red-500 text-[10px] sm:text-xs font-medium text-white">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-64 sm:w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="p-3 sm:p-4">
                <h3 className="mb-2 text-xs sm:text-sm font-semibold text-gray-900">Notifications</h3>
                <p className="text-xs sm:text-sm text-gray-500">No new notifications</p>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative border-l border-gray-200 pl-2 sm:pl-4">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 sm:gap-3 rounded-lg px-1 sm:px-2 py-1 sm:py-1.5 transition-colors hover:bg-gray-100"
          >
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gray-300">
                <span className="text-xs sm:text-sm font-medium text-gray-600">
                  {user.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() || 'A'}
                </span>
              </div>
              {/* Online Status Indicator */}
              <span className="absolute bottom-0 right-0 h-2 w-2 sm:h-3 sm:w-3 rounded-full border-2 border-white bg-green-500"></span>
            </div>

            {/* User Info - Hidden on mobile */}
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-gray-900">
                {user.name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500">
                {user.role || 'Manager'}
              </p>
            </div>

            {/* Dropdown Arrow */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`text-gray-400 transition-transform hidden sm:block ${
                showProfileMenu ? 'rotate-180' : ''
              }`}
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-40 sm:w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="p-2">
                {/* <a
                  href="#"
                  className="block rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Profile Settings
                </a>
                <a
                  href="#"
                  className="block rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Preferences
                </a> */}
                <hr className="my-1 border-gray-200" />
                <button
                  onClick={() => {
                    setShowLogoutModal(true);
                    setShowProfileMenu(false);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-xs sm:text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
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
    </div>
  );
};

export default Navbar;