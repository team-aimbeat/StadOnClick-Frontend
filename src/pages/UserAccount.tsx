import Breadcrumb from "@/components/shared/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddShippingAddressDialog } from "@/components/modals/account/AddShippingAddressDialog";
import { ReferralProgramCard } from "@/components/referrals/ReferralProgramCard";
import { cn } from "@/lib/utils";
import { Eye, Lock, MapPin, Sparkles, User } from "lucide-react";
import React from "react";
import { StepPersonalize } from "@/components/shared/user-onboarding/StepPersonalize";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { setUser } from "@/features/auth/authSlice";
import { Navigate } from "react-router-dom";
import {
  useChangePasswordMutation,
  useCreateShippingAddressMutation,
  useDeleteShippingAddressMutation,
  useGetProfileQuery,
  useListShippingAddressesQuery,
  useUpdateProfileMutation,
  useUpdateShippingAddressMutation,
} from "@/features/account/api/accountApi";
import { useUploadAvatarMutation } from "@/features/auth/api/authApi";
import type { ShippingAddressFormInput } from "@/features/account/api/accountApi";

type SectionKey = "personal" | "password" | "shipping"  | "personalization";

type NavigationItem = {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  section: SectionKey;
  requiresPassword?: boolean;
};

const navigation: NavigationItem[] = [
  { label: "Personal info", icon: User, section: "personal" },
  { label: "Change password", icon: Lock, section: "password", requiresPassword: true },
  { label: "Shipping addresses", icon: MapPin, section: "shipping" },
  { label: "Personalization", icon: Sparkles, section: "personalization" },
];

const sectionDescriptions: Record<SectionKey, string> = {
  personal: "Keep your account details up to date.",
  password: "Update your password to keep your account secure.",
  shipping: "Manage the addresses you typically ship to.",
  personalization: "Manage your personalization preferences.",
};

const genderOptions = [
  { value: "FEMALE", label: "Female" },
  { value: "MALE", label: "Male" },
  { value: "NON_BINARY", label: "Non-binary" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

const UserAccount = () => {
  const [personalForm, setPersonalForm] = React.useState({
    firstName: "",
    lastName: "",
    gender: "",
    phone: "",
  });
  const [initialPersonalForm, setInitialPersonalForm] = React.useState(personalForm);
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const user = useAppSelector((state) => state.auth.user);
  const availableNavigation = React.useMemo(
    () =>
      navigation.filter(
        (item) => !item.requiresPassword || Boolean(user?.hasPassword),
      ),
    [user?.hasPassword],
  );
  const [activeSection, setActiveSection] = React.useState<SectionKey>("personal");
  const activeNavItem = availableNavigation.find(
    (item) => item.section === activeSection,
  );
  const [avatarPreview, setAvatarPreview] = React.useState<string>("");
  const avatarUrlRef = React.useRef<string | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  const isBootstrapping = useAppSelector((state) => state.auth.isBootstrapping);
  const [pendingAvatarFile, setPendingAvatarFile] = React.useState<File | null>(null);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();

  const { data: profileResponse, isFetching: isProfileLoading } = useGetProfileQuery(undefined, { skip: !user });
  const profile = profileResponse?.data;
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const {
    data: shippingResponse,
    isFetching: isShippingLoading,
  } = useListShippingAddressesQuery(undefined, { skip: !user });
  const shippingAddresses = shippingResponse?.data ?? [];
  const [createShippingAddress, { isLoading: isCreatingAddress }] = useCreateShippingAddressMutation();
  const [updateShippingAddress, { isLoading: isUpdatingShipping }] = useUpdateShippingAddressMutation();
  const [deleteShippingAddress, { isLoading: isDeletingAddress }] = useDeleteShippingAddressMutation();

  React.useEffect(() => {
    if (!profile) return;
    const normalized = {
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      gender: profile.gender ?? "",
      phone: profile.phone ?? "",
    };
    setPersonalForm(normalized);
    setInitialPersonalForm(normalized);
  }, [profile]);

  React.useEffect(() => {
    if (pendingAvatarFile) return;
    if (user?.profileImageUrl) {
      setAvatarPreview(user.profileImageUrl);
    }
  }, [pendingAvatarFile, user?.profileImageUrl]);

  React.useEffect(() => {
    if (!availableNavigation.length) return;
    if (!availableNavigation.some((item) => item.section === activeSection)) {
      setActiveSection(availableNavigation[0].section);
    }
  }, [availableNavigation, activeSection]);

  const isPersonalDirty = React.useMemo(
    () =>
      JSON.stringify(personalForm) !== JSON.stringify(initialPersonalForm),
    [personalForm, initialPersonalForm],
  );

  const handlePasswordSubmit = React.useCallback(async () => {
    try {
      await changePassword(passwordForm).unwrap();
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordError(null);
      toast.success("Password updated");
    } catch (error) {
      setPasswordError("Unable to change password");
    }
  }, [changePassword, passwordForm]);

  const isPasswordValid =
    Boolean(passwordForm.currentPassword) &&
    Boolean(passwordForm.newPassword) &&
    passwordForm.newPassword === passwordForm.confirmPassword;

  const handleCreateAddress = React.useCallback(
    async (values: ShippingAddressFormInput) => {
      try {
        await createShippingAddress(values).unwrap();
        toast.success("Shipping address saved");
      } catch (error) {
        toast.error("Unable to save address");
        throw error;
      }
    },
    [createShippingAddress],
  );

  const handleSetDefaultAddress = React.useCallback(
    async (addressId: string) => {
      try {
        await updateShippingAddress({ id: addressId, data: { isDefault: true } }).unwrap();
        toast.success("Default address set");
      } catch (error) {
        toast.error("Unable to update default address");
      }
    },
    [updateShippingAddress],
  );

  const handleDeleteAddress = React.useCallback(
    async (addressId: string) => {
      try {
        await deleteShippingAddress(addressId).unwrap();
        toast.success("Address removed");
      } catch (error) {
        toast.error("Unable to remove address");
      }
    },
    [deleteShippingAddress],
  );

  React.useEffect(() => {
    if (!user) return;
    dispatch(setPageTitle("My Account"));
  }, [dispatch, user]);

  if (!user && !isBootstrapping) {
    return <Navigate to="/sign-in" replace />;
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (avatarUrlRef.current) {
      URL.revokeObjectURL(avatarUrlRef.current);
    }
    const localUrl = URL.createObjectURL(file);
    avatarUrlRef.current = localUrl;
    setAvatarPreview(localUrl);
    setPendingAvatarFile(file);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    let updatedAvatarUrl = user?.profileImageUrl ?? null;

    if (pendingAvatarFile) {
      const formData = new FormData();
      formData.append("profileImage", pendingAvatarFile);
      try {
        const response = await uploadAvatar(formData).unwrap();
        if (response.profileImageUrl) {
          updatedAvatarUrl = response.profileImageUrl;
          if (user) {
            dispatch(setUser({ ...user, profileImageUrl: response.profileImageUrl }));
          }
          setAvatarPreview(response.profileImageUrl);
        }
        setPendingAvatarFile(null);
      } catch (error) {
        toast.error("Unable to upload avatar");
        setIsSavingProfile(false);
        return;
      }
    }

    try {
      const payload = {
        firstName: personalForm.firstName || undefined,
        lastName: personalForm.lastName || undefined,
        gender: personalForm.gender || undefined,
        phone: personalForm.phone || undefined,
      };
      const response = await updateProfile(payload).unwrap();
      const updatedValues = {
        firstName: response.data.firstName ?? "",
        lastName: response.data.lastName ?? "",
        gender: response.data.gender ?? "",
        phone: response.data.phone ?? "",
      };
      setPersonalForm(updatedValues);
      setInitialPersonalForm(updatedValues);
      if (updatedAvatarUrl && user) {
        dispatch(setUser({ ...user, profileImageUrl: updatedAvatarUrl }));
      }
      toast.success("Profile updated");
    } catch (error) {
      toast.error("Unable to save profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (avatarUrlRef.current) {
        URL.revokeObjectURL(avatarUrlRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumb />
        <div className="mt-6 space-y-6">
          <div>
          
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              My Account
            </h1>
          </div>
          <ReferralProgramCard />
          <div className="grid gap-8 lg:grid-cols-[260px,1fr]">
            <section className="rounded-3xl border border-slate-200 bg-white/60 p-4">
              <div className="px-1 pb-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                Account
              </div>
              <div className="space-y-2">
                {availableNavigation.map((item) => {
                  const isActive = item.section === activeSection;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setActiveSection(item.section)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-sm font-medium transition hover:border-slate-300 hover:bg-white",
                        isActive
                          ? "border-slate-300 bg-slate-100 text-slate-900"
                          : "text-slate-600"
                      )}
                    >
                      <item.icon className="h-5 w-5 text-slate-600" />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
            <section className="rounded-3xl border border-slate-200 bg-white px-6 py-7 lg:px-8">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  {activeNavItem?.label ?? "Personal info"}
                </h2>
                <p className="text-sm text-slate-500">
                  {sectionDescriptions[activeSection]}
                </p>
              </div>
              {activeSection === "personal" ? (
                <>
                  <div className="mt-6 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-100">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="User avatar"
                            className="h-14 w-14 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-slate-500">
                            Upload
                          </span>
                        )}
                      </div>
                      <div className="">
                        <p className="text-sm font-semibold text-slate-900">
                          Profile picture
                        </p>
                        <p className="text-xs text-slate-500">
                          PNG, JPG up to 2MB
                        </p>
                      </div>
                    </div>
                    <label
                      htmlFor="profile-photo"
                      className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500"
                    >
                      Upload photo
                    </label>
                    <input
                      id="profile-photo"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={isUploadingAvatar}
                    />
                  </div>
                  <div className="mt-6 grid gap-6 lg:grid-cols-[repeat(2,minmax(0,1fr))]">
                    <div className="space-y-1">
                      <Label htmlFor="first-name">First name</Label>
                      <Input
                        id="first-name"
                        value={personalForm.firstName}
                        onChange={(event) =>
                          setPersonalForm((prev) => ({
                            ...prev,
                            firstName: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="last-name">Last name</Label>
                      <Input
                        id="last-name"
                        value={personalForm.lastName}
                        onChange={(event) =>
                          setPersonalForm((prev) => ({
                            ...prev,
                            lastName: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={personalForm.gender}
                        onValueChange={(value) =>
                          setPersonalForm((prev) => ({
                            ...prev,
                            gender: value,
                          }))
                        }
                      >
                        <SelectTrigger id="gender" className="w-full">
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {genderOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-6 space-y-1">
                    <Label htmlFor="phone-number">Phone number</Label>
                    <Input
                      id="phone-number"
                      placeholder="Recipient Phone Number"
                      type="tel"
                      value={personalForm.phone}
                      onChange={(event) =>
                        setPersonalForm((prev) => ({
                          ...prev,
                          phone: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="mt-6 space-y-2 rounded-2xl border border-slate-200 bg-slate-100/70 p-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email">Email Address</Label>
                      <button
                        type="button"
                        className="text-xs font-semibold text-[#0b59a2] transition hover:underline"
                      >
                        Change Email
                      </button>
                    </div>
                    <Input
                      id="email"
                      defaultValue={user?.email}
                      disabled
                    />
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button
                      className="rounded-full bg-slate-900 px-8 py-3 text-base shadow-none"
                      disabled={
                        !(isPersonalDirty || pendingAvatarFile) ||
                        isUpdatingProfile ||
                        isSavingProfile
                      }
                      onClick={handleSaveProfile}
                    >
                      {isUpdatingProfile || isSavingProfile ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </>
              ) : activeSection === "password" ? (
                <div className="mt-6 space-y-5">
                  {[
                    { label: "Current password", field: "currentPassword" },
                    { label: "New password", field: "newPassword" },
                    { label: "Confirm password", field: "confirmPassword" },
                  ].map(({ label, field }) => (
                    <div className="space-y-1" key={label}>
                      <Label htmlFor={`password-${field}`}>{label}</Label>
                      <div className="relative">
                        <Input
                          id={`password-${field}`}
                          type="password"
                          placeholder=""
                          className="pr-12"
                          value={passwordForm[field as keyof typeof passwordForm]}
                          onChange={(event) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              [field]: event.target.value,
                            }))
                          }
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <Eye className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  ))}
                  {passwordError ? (
                    <p className="text-xs font-medium text-red-600">{passwordError}</p>
                  ) : null}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">Forgot Password?</p>
                    <Button
                      className="rounded-full bg-slate-900 px-8 py-3 text-base shadow-none"
                      disabled={!isPasswordValid || isChangingPassword}
                      onClick={handlePasswordSubmit}
                    >
                      {isChangingPassword ? "Saving..." : "Change password"}
                    </Button>
                  </div>
                </div>
              ) : activeSection === "shipping" ? (
                <div className="mt-6 space-y-6 border-b border-slate-200 pb-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">
                        Saved addresses
                      </p>
                      <p className="text-sm text-slate-500">
                        Add or update addresses to keep deliveries on schedule.
                      </p>
                    </div>
                    <Button
                      className="rounded-full bg-slate-900 px-6 py-3 text-base shadow-none"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      + Add shipping address
                    </Button>
                  </div>
                  {isShippingLoading ? (
                    <p className="text-sm text-slate-500">Loading addresses…</p>
                  ) : shippingAddresses.length ? (
                    <div className="space-y-3">
                      {shippingAddresses.map((address) => (
                        <div
                          key={address.id}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {address.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {address.address1}
                                {address.address2 ? `, ${address.address2}` : ""}
                              </p>
                              <p className="text-xs text-slate-500">
                                {address.city}, {address.county ?? "Sweden"} {address.postalCode}
                              </p>
                            </div>
                            {address.isDefault ? (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">
                                Default
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {!address.isDefault ? (
                              <button
                                type="button"
                                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
                                onClick={() => handleSetDefaultAddress(address.id)}
                                disabled={isUpdatingShipping}
                              >
                                Make default
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                              onClick={() => handleDeleteAddress(address.id)}
                              disabled={isDeletingAddress}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                      <MapPin className="mx-auto h-6 w-6 text-slate-400" />
                      <p className="mt-3 font-semibold text-slate-900">No addresses yet</p>
                      <p>Add an address to speed up future orders.</p>
                    </div>
                  )}
                  <AddShippingAddressDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    onSubmit={handleCreateAddress}
                    isLoading={isCreatingAddress}
                  />
                </div>
              ) : activeSection === "personalization" ? (
                <div className="mt-6">
                  <StepPersonalize onNext={() => {}} onSkip={() => {}} />
                </div>
              ) : (
                <div className="mt-6 text-sm text-slate-500">
                  Selected section is coming soon. Please check back later.
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
