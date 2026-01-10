import { HiOutlineCloudArrowUp } from "react-icons/hi2";
import React from "react";
import gym from "@/assets/Images/gym.png";

export type BusinessDetails = {
  businessName: string;
  businessType: string;
  location: string;
  phone: string;
  description: string;
};

type BusinessDetailsFormProps = {
  details: BusinessDetails;
  onDetailChange: (field: keyof BusinessDetails, value: string) => void;
  selectedFacilities: string[];
  onFacilityToggle: (facility: string) => void;
  facilityError?: string;
  errors: string[];
  uploadFileName?: string;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const facilityOptions = [
  "Free weights",
  "Cardio machines",
  "Showers",
  "Wifi",
  "Personal training",
  "Classes",
];

const maxDescriptionLength = 500;

const BusinessDetailsForm: React.FC<BusinessDetailsFormProps> = ({
  details,
  onDetailChange,
  selectedFacilities,
  onFacilityToggle,
  facilityError,
  errors,
  uploadFileName,
  onUpload,
}) => {
  const hasError = (label: string) => errors.includes(label);

  return (
    <div className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="flex flex-col items-center gap-2 text-center text-slate-700">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
          <img src={gym} alt="Business icon" className="h-8 w-8" />
        </div>
        <p className="text-lg font-semibold text-slate-900">Tell us about your business</p>
        <p className="text-sm text-slate-500">This helps customers understand your services and book with confidence.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Business name
          </label>
          <input
            type="text"
            value={details.businessName}
            onChange={(event) => onDetailChange("businessName", event.target.value)}
            placeholder="Gym name"
            className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${hasError("Business name") ? "border-rose-500 focus:border-rose-500" : "border-slate-200 bg-white focus:border-blue-500"}`}
          />
          {hasError("Business name") && (
            <p className="mt-1 text-[11px] text-rose-600">This field is required.</p>
          )}
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Business type
          </label>
          <input
            type="text"
            value={details.businessType}
            onChange={(event) => onDetailChange("businessType", event.target.value)}
            placeholder="Business type"
            className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${hasError("Business type") ? "border-rose-500 focus:border-rose-500" : "border-slate-200 bg-white focus:border-blue-500"}`}
          />
          {hasError("Business type") && (
            <p className="mt-1 text-[11px] text-rose-600">This field is required.</p>
          )}
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Location
          </label>
          <input
            type="text"
            value={details.location}
            onChange={(event) => onDetailChange("location", event.target.value)}
            placeholder="Location"
            className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${hasError("Location") ? "border-rose-500 focus:border-rose-500" : "border-slate-200 bg-white focus:border-blue-500"}`}
          />
          {hasError("Location") && (
            <p className="mt-1 text-[11px] text-rose-600">This field is required.</p>
          )}
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Phone
          </label>
          <input
            type="tel"
            value={details.phone}
            onChange={(event) => onDetailChange("phone", event.target.value)}
            placeholder="Phone number"
            className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${hasError("Phone") ? "border-rose-500 focus:border-rose-500" : "border-slate-200 bg-white focus:border-blue-500"}`}
          />
          {hasError("Phone") && (
            <p className="mt-1 text-[11px] text-rose-600">This field is required.</p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Description <span className="text-[10px] text-slate-400">(max {maxDescriptionLength} characters)</span>
        </label>
        <textarea
          value={details.description}
          onChange={(event) => onDetailChange("description", event.target.value)}
          maxLength={maxDescriptionLength}
          rows={4}
          placeholder="Describe your business, pricing, availability, and policies."
          className={`mt-1 w-full rounded-2xl border px-3 py-2 text-sm leading-relaxed ${hasError("Description") ? "border-rose-500 focus:border-rose-500" : "border-slate-200 bg-white focus:border-blue-500"}`}
        />
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
          <span>{details.description.length} / {maxDescriptionLength}</span>
          {hasError("Description") && (
            <span className="text-rose-600">Please add a description.</span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Business facilities</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {facilityOptions.map((facility) => {
            const isActive = selectedFacilities.includes(facility);
            return (
              <button
                key={facility}
                type="button"
                onClick={() => onFacilityToggle(facility)}
                className={`rounded-full border px-4 py-1 text-xs font-semibold transition ${
                  isActive
                    ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                }`}
              >
                {facility}
              </button>
            );
          })}
        </div>
        {facilityError && <p className="mt-2 text-[11px] text-rose-600">{facilityError}</p>}
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-4">
        <div className="flex items-center gap-3">
          <HiOutlineCloudArrowUp className="h-6 w-6 text-slate-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700">Upload business image</p>
            <p className="text-xs text-slate-500">JPEG, PNG, PDF, or MP4 formats, up to 50MB.</p>
          </div>
          <label
            htmlFor="business-details-upload"
            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm hover:border-slate-400"
          >
            Browse file
          </label>
        </div>
        <input
          id="business-details-upload"
          type="file"
          accept=".jpeg,.jpg,.png,.pdf,.mp4"
          className="hidden"
          onChange={onUpload}
        />
        {uploadFileName && <p className="mt-2 text-xs text-slate-500">Selected file: {uploadFileName}</p>}
      </div>
    </div>
  );
};

export default BusinessDetailsForm;
