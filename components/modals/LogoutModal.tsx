'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md w-[95%] p-0 overflow-hidden">
        {/* Icon Header */}
        <div className="flex flex-col items-center pt-8 pb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
            <LogOut className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <AlertDialogHeader className="px-6 pb-2 text-center">
          <AlertDialogTitle className="text-xl font-semibold text-gray-900 text-center">
            Confirm Logout
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-gray-500 text-center mt-2">
            Are you sure you want to logout? You will need to sign in again to access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="px-6 pb-6 pt-4 flex flex-col sm:flex-row gap-3">
          <AlertDialogCancel
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 cursor-pointer px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 cursor-pointer px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Logout
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutModal;

