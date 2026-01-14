
import BusinessDetailsForm, { BusinessDetails } from '@/components/BusinessDetailsForm';
import VendorInfoForm, { VendorInfo } from '@/components/VendorInfoForm';
import SeoAdvancedSection from '@/components/SeoAdvancedSection';
import VendorSetupSummary from '@/components/VendorSetupSummary';
import React, { useEffect, useState } from 'react';
import {
  HiOutlineShoppingBag,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineUser,
  HiShieldCheck,
  HiInformationCircle,
  HiOutlineArrowRight,
  HiCheck,
} from 'react-icons/hi2';

import profile7 from '@/assets/Images/profile-7.jpeg';
import verify from '@/assets/Images/right.png';
import crown from '@/assets/Images/crown.png';
import KycStatusCard from '@/components/KycStatusCard';
import CategorySelectionCard from '@/components/CategorySelectionCard';
import AdminDashboardSkeleton from '@/components/skeletons/AdminDashboardSkeleton';
import Breadcrumb from '@/components/shared/Breadcrumb';
import StatCard from '@/components/shared/StatCard';
import { setPageTitle } from '@/features/Layout/themeConfigSlice';
import { useAppDispatch } from '@/app/hooks';

const workflowSteps = [
  { id: 1, title: 'Vendor information', subtitle: 'Add personal & business contact info' },
  { id: 2, title: 'KYC verification', subtitle: 'Submit ID, registration & tax docs' },
  { id: 3, title: 'Business services', subtitle: 'Select services & categories' },
  { id: 4, title: 'Business details', subtitle: 'Provide pricing, availability & policies' },
  { id: 5, title: 'SEO', subtitle: 'Add discovery-friendly descriptions & media' },
  { id: 6, title: 'Preview & confirm', subtitle: 'Review everything before publishing' },
];

const BUSINESS_FIELD_LABELS: Record<keyof BusinessDetails, string> = {
  businessName: 'Business name',
  businessType: 'Business type',
  location: 'Location',
  phone: 'Phone',
  description: 'Description',
};

const VendorDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const [vendorInfo, setVendorInfo] = useState<VendorInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',

    website: '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryError, setCategoryError] = useState("");
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
    businessName: '',
    businessType: '',
    location: '',
    phone: '',
    description: '',
  });
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [businessErrors, setBusinessErrors] = useState<string[]>([]);
  const [businessFacilityError, setBusinessFacilityError] = useState('');
  const [businessUploadName, setBusinessUploadName] = useState('');
  const [seoSectionOpen, setSeoSectionOpen] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [seoKeywordInput, setSeoKeywordInput] = useState('');
  const [seoKeywordError, setSeoKeywordError] = useState('');
  const [allowIndexing, setAllowIndexing] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = workflowSteps.length;
  const isSetupComplete = currentStep > totalSteps;

  const validateVendorInfo = () => {
    const missing: string[] = [];
    if (!vendorInfo.firstName.trim()) missing.push('First name');
    if (!vendorInfo.lastName.trim()) missing.push('Last name');
    if (!vendorInfo.email.trim()) missing.push('Email');
    if (!vendorInfo.phone.trim()) missing.push('Phone number');
    if (!vendorInfo.location.trim()) missing.push('Location');
    return missing;
  };

  const handleContinueSetup = () => {
    if (currentStep === 1) {
      const missing = validateVendorInfo();
      if (missing.length) {
        setFormErrors(missing);
        return;
      }
      setFormErrors([]);
    }

    if (currentStep === 3) {
      if (selectedCategories.length === 0) {
        setCategoryError("Select at least one category.");
        return;
      }
      setCategoryError("");
    }

    if (currentStep === 4) {
      const missingFields: string[] = [];
      if (!businessDetails.businessName.trim()) missingFields.push("Business name");
      if (!businessDetails.businessType.trim()) missingFields.push("Business type");
      if (!businessDetails.location.trim()) missingFields.push("Location");
      if (!businessDetails.phone.trim()) missingFields.push("Phone");
      if (!businessDetails.description.trim()) missingFields.push("Description");

      setBusinessErrors(missingFields);
      if (missingFields.length) {
        return;
      }

      if (selectedFacilities.length === 0) {
        setBusinessFacilityError("Select at least one facility.");
        return;
      }
      setBusinessFacilityError("");
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps + 1));
  };

  const handleVendorChange = (field: keyof VendorInfo, value: string) => {
    setVendorInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  };

  const handleBusinessDetailChange = (field: keyof BusinessDetails, value: string) => {
    setBusinessDetails((prev) => ({ ...prev, [field]: value }));
    const label = BUSINESS_FIELD_LABELS[field];
    setBusinessErrors((prev) => prev.filter((error) => error !== label));
  };

  const handleFacilityToggle = (facility: string) => {
    setBusinessFacilityError('');
    setSelectedFacilities((prev) =>
      prev.includes(facility) ? prev.filter((item) => item !== facility) : [...prev, facility]
    );
  };

  const handleBusinessUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBusinessUploadName(file.name);
      return;
    }
    setBusinessUploadName('');
  };

  const toggleSeoSection = () => {
    setSeoSectionOpen((prev) => !prev);
  };

  const resetSeoKeywordError = () => {
    setSeoKeywordError("");
  };

  const addSeoKeyword = () => {
    const value = seoKeywordInput.trim();
    if (!value) {
      return;
    }
    if (seoKeywords.length >= 20) {
      setSeoKeywordError("You can add up to 20 keywords.");
      return;
    }
    if (value.length < 2 || value.length > 40) {
      setSeoKeywordError("Each keyword must be between 2 and 40 characters.");
      return;
    }
    if (seoKeywords.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setSeoKeywordError("Keyword already added.");
      return;
    }
    setSeoKeywords((prev) => [...prev, value]);
    setSeoKeywordInput('');
    resetSeoKeywordError();
  };

  const onSeoKeywordKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSeoKeyword();
    }
  };

  const removeSeoKeyword = (keyword: string) => {
    setSeoKeywords((prev) => prev.filter((item) => item !== keyword));
  };

  const toggleIndexing = () => {
    setAllowIndexing((prev) => !prev);
  };

  const handleCategoryToggle = (category: string) => {
    setCategoryError("");
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  };

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  useEffect(() => {
    dispatch(setPageTitle("Vendor Dashboard"));
  }, [dispatch]);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;
    if (!isSetupComplete) {
      sidebar.classList.add("vendor-sidebar-locked");
    } else {
      sidebar.classList.remove("vendor-sidebar-locked");
    }
    return () => {
      sidebar.classList.remove("vendor-sidebar-locked");
    };
  }, [isSetupComplete]);

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen text-slate-900">
      <Breadcrumb />

      {!isSetupComplete ? (
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg w-full">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Vendor Onboarding</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Complete your business setup</h2>
              <p className="text-sm text-slate-500">
                Finish all six required steps and unlock the vendor dashboard features.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <HiShieldCheck className="h-4 w-4 text-emerald-500" />
              Secure flow
            </div>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto py-4">
            {workflowSteps.map((step, index) => {
              const isComplete = step.id < currentStep;
              const isActive = step.id === currentStep;
              return (
                <React.Fragment key={`workflow-${step.id}`}>
                  <div className="flex flex-col items-center gap-1 min-w-[120px] text-center">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        isComplete
                          ? 'border-blue-900 bg-blue-500 text-white'
                          : isActive
                            ? 'border-blue-500 bg-white text-blue-500'
                            : 'border-slate-200 bg-white text-slate-400'
                      }`}
                    >
                      {isComplete ? <HiCheck className="h-4 w-4" /> : <span className="text-sm font-semibold">{step.id}</span>}
                    </span>
                    <p className="text-xs font-semibold text-slate-700">{step.title}</p>
                    <p className="text-[11px] text-slate-400">{step.subtitle}</p>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div
                      className={`h-[2px] w-10 ${step.id < currentStep ? 'bg-blue-500' : 'bg-slate-200'}`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {currentStep === 1 && (
            <div className="mx-auto w-full max-w-2xl">
              <VendorInfoForm
                vendorInfo={vendorInfo}
                onVendorChange={handleVendorChange}
                photoPreview={photoPreview}
                onPhotoChange={handlePhotoChange}
                formErrors={formErrors}
              />
            </div>
          )}


          {currentStep === 2 && (
            <div className="mx-auto w-full max-w-2xl">
              <KycStatusCard
                status="pending"
                onBack={() => setCurrentStep(1)}
                onAction={handleContinueSetup}
              />
            </div>
          )}
          {currentStep === 3 && (
            <div className="mx-auto w-full max-w-2xl">
              <CategorySelectionCard
                selected={selectedCategories}
                onToggle={handleCategoryToggle}
                error={categoryError}
              />
            </div>
          )}
          {currentStep === 4 && (
            <div className="mx-auto w-full max-w-3xl">
              <BusinessDetailsForm
                details={businessDetails}
                onDetailChange={handleBusinessDetailChange}
                selectedFacilities={selectedFacilities}
                onFacilityToggle={handleFacilityToggle}
                facilityError={businessFacilityError}
                errors={businessErrors}
                uploadFileName={businessUploadName}
                onUpload={handleBusinessUploadChange}
              />
            </div>
          )}
          {currentStep === 5 && (
            <div className="mx-auto w-full max-w-3xl">
              <SeoAdvancedSection
                isOpen={seoSectionOpen}
                onToggle={toggleSeoSection}
                title={seoTitle}
                description={seoDescription}
                keywords={seoKeywords}
                keywordInput={seoKeywordInput}
                keywordError={seoKeywordError}
                allowIndexing={allowIndexing}
                onTitleChange={setSeoTitle}
                onDescriptionChange={setSeoDescription}
                onKeywordInputChange={(value) => {
                  setSeoKeywordInput(value);
                  resetSeoKeywordError();
                }}
                onAddKeyword={addSeoKeyword}
                onKeywordKeyDown={onSeoKeywordKeyDown}
                onRemoveKeyword={removeSeoKeyword}
                onToggleIndexing={toggleIndexing}
              />
            </div>
          )}
          {currentStep === 6 && (
            <div className="mx-auto w-full max-w-4xl">
              <VendorSetupSummary
                vendorInfo={vendorInfo}
                categories={selectedCategories}
                businessDetails={businessDetails}
                facilities={selectedFacilities}
                seoTitle={seoTitle}
                seoDescription={seoDescription}
                seoKeywords={seoKeywords}
                allowIndexing={allowIndexing}
              />
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <HiInformationCircle className="h-4 w-4 text-blue-500" />
              <span>
                Current step: {currentStep <= totalSteps ? workflowSteps[currentStep - 1].title : 'Review & confirm'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleContinueSetup}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {currentStep <= totalSteps ? 'Continue setup' : 'Finish onboarding'}
              <HiOutlineArrowRight className="h-3 w-3" />
            </button>
          </div>

          <p className="text-xs text-slate-500">All dashboard widgets remain locked until the setup is complete.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <img
                src={profile7}
                alt="Vendor profile"
                className="h-15 w-15 rounded-full object-cover"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">Saalim Shaikh</p>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-green">
                    <img src={verify} className="h-5 w-5 inline-block mr-2" />
                    Verified
                  </span>
                </div>
                <p className="text-xs text-gray-500">Plumbing services Aú Malmo</p>
              </div>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold shadow-sm transition text-amber-700 hover:bg-amber-300 hover:text-amber-900">
              <img src={crown} className="h-5 w-7 inline-block mr-2" />
              Buy plan
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-5 gap-4">
            <StatCard
              title="Today's orders"
              value={9934}
              percentage={6.3}
              trend="up"
              icon={HiOutlineShoppingBag}
              accentColor="blue"
              subtitle="Today's Orders"
            />

            <StatCard
              title="Active vel today"
              value={3812}
              percentage={50}
              trend="down"
              icon={HiOutlineChartBar}
              accentColor="purple"
              subtitle="Active visit Today"
            />

            <StatCard
              title="Active customer today"
              value={132}
              percentage={132}
              trend="up"
              icon={HiOutlineUserGroup}
              accentColor="green"
              subtitle="Active Customer Today"
            />

            <StatCard
              title="Active customer today"
              value={132}
              percentage={132}
              trend="down"
              icon={HiOutlineUserGroup}
              accentColor="yellow"
              subtitle="Active User Today"
            />

            <StatCard
              title="Active user today"
              value={132}
              percentage={120}
              trend="up"
              icon={HiOutlineUser}
              accentColor="red"
              subtitle="New User Today"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default VendorDashboard;
