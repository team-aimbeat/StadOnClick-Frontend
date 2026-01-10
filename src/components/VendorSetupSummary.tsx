import React from "react";
import { 
  User, MapPin, Mail, Phone, Building, Tags, 
  FileText, Globe, CheckCircle2, EyeOff 
} from "lucide-react";
import { VendorInfo } from "./VendorInfoForm";
import { BusinessDetails } from "./BusinessDetailsForm";

type VendorSetupSummaryProps = {
  vendorInfo: VendorInfo;
  categories: string[];
  businessDetails: BusinessDetails;
  facilities: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  allowIndexing: boolean;
};

const VendorSetupSummary: React.FC<VendorSetupSummaryProps> = ({
  vendorInfo,
  categories,
  businessDetails,
  facilities,
  seoTitle,
  seoDescription,
  seoKeywords,
  allowIndexing,
}) => {
  const placeholder = (value: string, fallback: string) => 
    value?.trim() || fallback;

  const InfoItem = ({ icon: Icon, label, value }: { 
    icon: any; 
    label: string; 
    value: string 
  }) => (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-slate-400">
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-slate-800 font-medium truncate">
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
       
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Review & Confirm Your Business
          </h2>
        </div>
        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-emerald-600" />
          All changes saved locally
        </div>
      </div>

      {/* Main content - Cards with subtle hover effect */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Vendor Info */}
        <div className="group relative rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="absolute -top-3 left-6 bg-white px-3 py-1 rounded-full border border-slate-200 text-xs font-semibold text-slate-600">
            Personal Information
          </div>
          
          <div className="mt-6 grid gap-5">
            <InfoItem 
              icon={User} 
              label="Full Name" 
              value={`${vendorInfo.firstName} ${vendorInfo.lastName}`.trim() || "Not provided"} 
            />
            <InfoItem 
              icon={MapPin} 
              label="Location" 
              value={placeholder(vendorInfo.location, "Not provided")} 
            />
            <InfoItem 
              icon={Mail} 
              label="Email" 
              value={placeholder(vendorInfo.email, "Not provided")} 
            />
            <InfoItem 
              icon={Phone} 
              label="Phone" 
              value={placeholder(vendorInfo.phone, "Not provided")} 
            />
          </div>
        </div>

        {/* Business Details */}
        <div className="group relative rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="absolute -top-3 left-6 bg-white px-3 py-1 rounded-full border border-slate-200 text-xs font-semibold text-slate-600">
            Business Information
          </div>
          
          <div className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoItem 
                icon={Building} 
                label="Business Name" 
                value={placeholder(businessDetails.businessName, "Not provided")} 
              />
              <InfoItem 
                icon={Tags} 
                label="Business Type" 
                value={placeholder(businessDetails.businessType, "Not provided")} 
              />
            </div>

            <InfoItem 
              icon={MapPin} 
              label="Business Location" 
              value={placeholder(businessDetails.location, "Not provided")} 
            />

            <InfoItem 
              icon={Phone} 
              label="Business Phone" 
              value={placeholder(businessDetails.phone, "Not provided")} 
            />

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Description
              </p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {placeholder(businessDetails.description, "No description provided yet...")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories & Facilities */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">What you offer</h3>
        
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              {categories.length > 0 ? (
                categories.map(cat => (
                  <span 
                    key={cat}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                  >
                    {cat}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400 italic">No categories selected</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">Facilities / Amenities</p>
            <div className="flex flex-wrap gap-2">
              {facilities.length > 0 ? (
                facilities.map(fac => (
                  <span 
                    key={fac}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100"
                  >
                    {fac}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400 italic">No facilities selected</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SEO Section */}
      <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white to-slate-50/50 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">SEO & Visibility</h3>
          <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
            allowIndexing 
              ? "bg-green-100 text-green-700" 
              : "bg-amber-100 text-amber-700"
          }`}>
            {allowIndexing ? (
              <Globe size={14} />
            ) : (
              <EyeOff size={14} />
            )}
            {allowIndexing ? "Search visible" : "Hidden from search"}
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-slate-500 font-medium mb-1">Page Title</p>
            <p className="text-slate-800 font-medium">{placeholder(seoTitle, "No title set")}</p>
          </div>
          
          <div>
            <p className="text-slate-500 font-medium mb-1">Meta Description</p>
            <p className="text-slate-700 leading-relaxed">
              {placeholder(seoDescription, "No meta description provided")}
            </p>
          </div>

          <div>
            <p className="text-slate-500 font-medium mb-1.5">Keywords</p>
            <div className="flex flex-wrap gap-2">
              {seoKeywords.length > 0 ? (
                seoKeywords.map(kw => (
                  <span 
                    key={kw}
                    className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-md border border-slate-200"
                  >
                    {kw}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 italic text-sm">No keywords added</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorSetupSummary;