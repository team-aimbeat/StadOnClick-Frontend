import React from "react";

export type VendorInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
};

type VendorInfoFormProps = {
  vendorInfo: VendorInfo;
  onVendorChange: (field: keyof VendorInfo, value: string) => void;
  photoPreview: string | null;
  onPhotoChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  formErrors: string[];
};

const VendorInfoForm: React.FC<VendorInfoFormProps> = ({
  vendorInfo,
  onVendorChange,
  photoPreview,
  onPhotoChange,
  formErrors,
}) => {
  const fieldError = (label: string) =>
    formErrors.includes(label) ? (
      <p className="mt-1 text-[11px] text-rose-600">This field is required.</p>
    ) : null;

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-900 shadow-lg">
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/70 p-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <img
            src={photoPreview ?? "https://via.placeholder.com/64?text=Photo"}
            alt="Vendor avatar preview"
            className="h-12 w-12 rounded-full object-cover"
          />
        </div>
        <p className="text-sm font-semibold text-slate-800">Upload your photo</p>
        <p className="text-xs text-slate-500">JPG, PNG or GIF up to 2 MB</p>
        <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-blue-600">
          Upload
          <input type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
        </label>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            First name
          </label>
          <input
            type="text"
            placeholder="First name"
            value={vendorInfo.firstName}
            onChange={(event) => onVendorChange("firstName", event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          {fieldError("First name")}
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Last name
          </label>
          <input
            type="text"
            placeholder="Last name"
            value={vendorInfo.lastName}
            onChange={(event) => onVendorChange("lastName", event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          {fieldError("Last name")}
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Preferred name
          </label>
          <input
            type="text"
            placeholder="What should we call you?"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Gender
          </label>
          <input
            type="text"
            placeholder="Gender"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Language
          </label>
          <input
            type="text"
            placeholder="Language"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Email
          </label>
          <input
            type="email"
            placeholder="Email"
            value={vendorInfo.email}
            onChange={(event) => onVendorChange("email", event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          {fieldError("Email")}
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Location
          </label>
          <input
            type="text"
            placeholder="Street, city"
            value={vendorInfo.location}
            onChange={(event) => onVendorChange("location", event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          {fieldError("Location")}
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Age
          </label>
          <input
            type="text"
            placeholder="Age"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </div>
   
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Phone number
          </label>
          <input
            type="tel"
            placeholder="Phone number"
            value={vendorInfo.phone}
            onChange={(event) => onVendorChange("phone", event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          {fieldError("Phone number")}
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Website (optional)
          </label>
          <input
            type="url"
            placeholder="Website"
            value={vendorInfo.website}
            onChange={(event) => onVendorChange("website", event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <input
          type="checkbox"
          checked
          className="form-checkbox h-4 w-4 rounded border-slate-300 text-blue-600"
          readOnly
        />
        <span>By continuing, you agree to the Terms of Service and Privacy Policy.</span>
      </div>

      {formErrors.length > 0 && (
        <div className="mt-3 rounded-xl bg-rose-50 px-4 py-2 text-xs font-medium text-rose-700">
          Please fill: {formErrors.join(", ")}
        </div>
      )}
    </div>
  );
};

export default VendorInfoForm;
