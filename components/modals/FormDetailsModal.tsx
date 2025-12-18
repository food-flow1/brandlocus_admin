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
import { FormEntry } from '@/lib/api/services/forms';

interface FormDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: FormEntry | null;
}

const DetailRow = ({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 border-b border-gray-100 last:border-0 ${className}`}>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="text-sm text-gray-900 sm:col-span-2 break-words">{value || '-'}</dd>
  </div>
);

const FormDetailsModal: React.FC<FormDetailsModalProps> = ({
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
            Form Details
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
          <div className="space-y-1">
            <DetailRow label="Form ID" value={data.formId} />
            <DetailRow label="Full Name" value={`${data.firstName} ${data.lastName}`} />
            <DetailRow label="Email" value={data.email} />
            <DetailRow label="Company Name" value={data.companyName} />
            <DetailRow 
              label="Service Needed" 
              value={
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {data.serviceNeeded.replace(/_/g, ' ')}
                </span>
              } 
            />
            <DetailRow 
              label="Status" 
              value={
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  data.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {data.status}
                </span>
              } 
            />
            <DetailRow 
              label="Submitted At" 
              value={data.submittedAt ? new Date(data.submittedAt).toLocaleString() : '-'} 
            />
            <DetailRow 
              label="Message" 
              value={<p className="whitespace-pre-wrap">{data.message}</p>} 
              className="border-b-0"
            />
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

export default FormDetailsModal;
