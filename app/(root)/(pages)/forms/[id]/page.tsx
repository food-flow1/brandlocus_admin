"use client"

import { useRouter } from 'next/navigation'
import { ChevronLeft, Pencil, Trash2, Download } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Mock form data - in real app, this would come from API based on [id]
const formData = {
  user: {
    firstName: 'Tunde',
    lastName: 'Afolabi',
    email: 'Tundeboyboyzillion@gmail.com',
    company: 'Nova Edge',
    sector: 'Agriculture',
  },
  serviceNeeded: 'Business Development',
  message: 'I need help with my agency i dont know why we are not growing and we have the proper structure',
  metadata: {
    dateCreated: 'October 23 2025',
    source: 'Website Contact Form',
  }
}

const FormDetailPage = () => {
  const router = useRouter()

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Go Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <span className="font-medium text-sm sm:text-base">Go Back</span>
      </button>

      {/* User Info Header */}
      <div className="text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
        <div className="flex items-center">
          <span className="text-gray-500">User: </span>
          <span className="font-semibold text-gray-900 ml-1">{formData.user.firstName} {formData.user.lastName}</span>
        </div>
        <span className="text-gray-400 mx-2 hidden sm:inline">|</span>
        <div className="flex items-center">
          <span className="text-gray-500">Company: </span>
          <span className="font-semibold text-gray-900 ml-1">{formData.user.company}</span>
        </div>
        <span className="text-gray-400 mx-2 hidden sm:inline">|</span>
        <div className="flex items-center">
          <span className="text-gray-500">Sector: </span>
          <span className="font-semibold text-gray-900 ml-1">{formData.user.sector}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Form Fields Card */}
        <Card className="lg:col-span-2 order-2 lg:order-1">
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* First Name */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700">First Name</label>
              <div className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm sm:text-base">
                {formData.user.firstName}
              </div>
            </div>

            {/* Last Name */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700">Last Name</label>
              <div className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm sm:text-base">
                {formData.user.lastName}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700">Email</label>
              <div className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm sm:text-base break-all">
                {formData.user.email}
              </div>
            </div>

            {/* Service Needed */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700">Service Needed</label>
              <div className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm sm:text-base">
                {formData.serviceNeeded}
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700">Company Name</label>
              <div className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm sm:text-base">
                {formData.user.company}
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700">Message</label>
              <div className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm sm:text-base min-h-[80px] sm:min-h-[120px]">
                {formData.message}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Data Sidebar */}
        <Card className="h-fit order-1 lg:order-2">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base font-semibold">Form Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1">
              <span className="text-xs sm:text-sm text-blue-500">Date Created: </span>
              <span className="text-xs sm:text-sm font-semibold text-gray-900">{formData.metadata.dateCreated}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1">
              <span className="text-xs sm:text-sm text-blue-500">Source: </span>
              <span className="text-xs sm:text-sm font-semibold text-gray-900">{formData.metadata.source}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
        <button className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm">
          <Pencil className="w-4 h-4" />
          Edit
        </button>
        <button className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors text-sm">
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
        <button className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
    </div>
  )
}

export default FormDetailPage