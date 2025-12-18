'use client';

import React from 'react';
import { X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { User } from '@/lib/api/services/users';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: User | null;
}

const DetailRow = ({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 border-b border-gray-100 last:border-0 ${className}`}>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="text-sm text-gray-900 sm:col-span-2 break-words">{value || '-'}</dd>
  </div>
);

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!data) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-2xl w-[95%] p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <AlertDialogHeader className="px-6 py-4 border-b border-gray-100 flex flex-row items-center justify-between space-y-0 sticky top-0 bg-white z-10">
          <AlertDialogTitle className="text-xl font-semibold text-gray-900">
            User Details
          </AlertDialogTitle>
          <AlertDialogCancel 
            onClick={onClose}
            className="mt-0 border-0 p-2 h-auto hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
            <span className="sr-only">Close</span>
          </AlertDialogCancel>
        </AlertDialogHeader>

        <div className="px-6 py-4 overflow-y-auto">
          <div className="flex flex-col items-center mb-6 pt-2">
            <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm mb-3">
              {data.profileImageUrl ? (
                <img src={data.profileImageUrl} alt={`${data.firstName} ${data.lastName}`} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-green-700">
                  {data.firstName?.[0]}{data.lastName?.[0]}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{`${data.firstName} ${data.lastName}`}</h3>
            <p className="text-sm text-gray-500">{data.email}</p>
          </div>

          <div className="space-y-1">
            <DetailRow label="User ID" value={data.userId} />
            <DetailRow label="Business Name" value={data.businessName} />
            <DetailRow label="Business Brief" value={<p className="whitespace-pre-wrap">{data.businessBrief}</p>} />
            <DetailRow label="Industry" value={data.industryName} />
            <DetailRow label="Country" value={data.country} />
            <DetailRow label="State" value={data.state} />
            <DetailRow label="Role" value={
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {data.role}
              </span>
            } />
            {/* <DetailRow 
              label="Status" 
              value={
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  (data as any).status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {(data as any).status || 'INACTIVE'}
                </span>
              } 
              className="border-b-0"
            /> */}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UserDetailsModal;
