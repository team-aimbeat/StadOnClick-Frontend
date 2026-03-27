import React from "react";
import { Navigate } from "react-router-dom";
import { HiOutlineCheckCircle, HiOutlineGlobeAlt } from "react-icons/hi2";
import {
  ShieldCheck,
  UserRound,
  Bell,
  Camera,
  Languages,
  Timer,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import {
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/features/account/api/accountApi";
import { useUploadAvatarMutation } from "@/features/auth/api/authApi";
import { setUser } from "@/features/auth/authSlice";
import toast from "react-hot-toast";

type SectionKey = "profile" | "security" | "preferences";

const navItems: {
  key: SectionKey;
  label: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}[] = [
  {
    key: "profile",
    label: "Personal info",
    description: "Basic identity and contact details",
    icon: UserRound,
  },
  {
    key: "security",
    label: "Security",
    description: "Password and account protection",
    icon: ShieldCheck,
  },
  {
    key: "preferences",
    label: "Preferences",
    description: "Language, time zone, notifications",
    icon: Bell,
  },
];

const languageOptions = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
];

const VendorSettings = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isBootstrapping = useAppSelector((state) => state.auth.isBootstrapping);

  const { data: profileResponse } = useGetProfileQuery(undefined, {
    skip: !user,
  });
  const profile = profileResponse?.data;

  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] =
    useUploadAvatarMutation();

  const [activeSection, setActiveSection] =
    React.useState<SectionKey>("profile");

  const [personalForm, setPersonalForm] = React.useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [initialPersonalForm, setInitialPersonalForm] = React.useState(
    personalForm,
  );

  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [preferences, setPreferences] = React.useState({
    language: languageOptions[0].value,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    productUpdates: true,
    marketingEmails: false,
  });

  const [avatarPreview, setAvatarPreview] = React.useState<string>("");
  const [pendingAvatarFile, setPendingAvatarFile] = React.useState<File | null>(
    null,
  );
  const avatarUrlRef = React.useRef<string | undefined>(undefined);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);

  React.useEffect(() => {
    dispatch(setPageTitle("Account Settings"));
  }, [dispatch]);

  React.useEffect(() => {
    if (!profile) return;
    const normalized = {
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
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
    const stored = localStorage.getItem("vendor-settings-preferences");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences((prev) => ({ ...prev, ...parsed }));
      } catch {
        /* noop */
      }
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem(
      "vendor-settings-preferences",
      JSON.stringify(preferences),
    );
  }, [preferences]);

  React.useEffect(() => {
    return () => {
      if (avatarUrlRef.current) {
        URL.revokeObjectURL(avatarUrlRef.current);
      }
    };
  }, []);

  if (!user && !isBootstrapping) {
    return <Navigate to="/vendor/sign-in" replace />;
  }

  const isPersonalDirty =
    JSON.stringify(personalForm) !== JSON.stringify(initialPersonalForm);

  const isPasswordValid =
    Boolean(passwordForm.currentPassword) &&
    Boolean(passwordForm.newPassword) &&
    passwordForm.newPassword === passwordForm.confirmPassword;

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
            dispatch(
              setUser({ ...user, profileImageUrl: response.profileImageUrl }),
            );
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
        phone: personalForm.phone || undefined,
      };
      const response = await updateProfile(payload).unwrap();
      const updatedValues = {
        firstName: response.data.firstName ?? "",
        lastName: response.data.lastName ?? "",
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

  return (
    <DashboardContainer className="space-y-8 pb-14">
      <TitleBreadCrumbs
        title="Account Settings"
        breadCrumbTitle="Vendor / Account Settings"
        className="w-full"
      />

      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white/80 p-4 ">
          <p className="px-1 pb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">
            Settings
          </p>
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === activeSection;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveSection(item.key)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition",
                    isActive
                      ? "border-blue-200 bg-blue-50 text-blue-900 shadow-[0_10px_30px_-18px_rgba(59,130,246,0.8)]"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg border",
                      isActive
                        ? "border-blue-300 bg-white text-blue-700"
                        : "border-slate-200 bg-slate-50 text-slate-500",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold leading-5">
                      {item.label}
                    </p>
                    <p className="text-[12px] text-slate-500">
                      {item.description}
                    </p>
                  </div>
                  {isActive ? (
                    <HiOutlineCheckCircle className="h-5 w-5 text-blue-500" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-[#f8f6ee] via-white to-[#fdfbf7] ">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
            <div>
              <p className="text-sm font-semibold text-slate-600">Setting</p>
              <h1 className="text-3xl font-semibold text-slate-900">
                Account Settings
              </h1>
              <p className="text-sm text-slate-500">
                Manage your preferences, security, and connected tools all in one
                place.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Profile health: Good
            </div>
          </div>

          <div className="space-y-10 px-6 py-8 lg:px-10">
            {activeSection === "profile" ? (
              <>
                <div className="flex flex-col gap-5 rounded-3xl  bg-white/90 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-white shadow-inner">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Profile"
                          className="h-18 w-18 rounded-full object-cover"
                        />
                      ) : (
                        <Camera className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Profile photo
                      </p>
                      <p className="text-xs text-slate-500">
                        PNG or JPG up to 2 MB.
                      </p>
                    </div>
                  </div>
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="vendor-avatar"
                        className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#f5c842] px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-[#f2b91e]"
                      >
                        Upload an image
                      </label>
                      <input
                        id="vendor-avatar"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={isUploadingAvatar}
                      />
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-full bg-white px-3 py-2 text-sm font-semibold text-red-500 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                        onClick={() => {
                          setAvatarPreview("");
                          setPendingAvatarFile(null);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm">
                  <div className="mb-5 flex flex-col gap-1">
                    <p className="text-lg font-semibold text-slate-900">
                      Personal Information
                    </p>
                    <p className="text-sm text-slate-500">
                      Edit your personal information
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold text-slate-800" htmlFor="vendor-first">
                      First name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="vendor-first"
                      value={personalForm.firstName}
                      onChange={(event) =>
                        setPersonalForm((prev) => ({
                          ...prev,
                          firstName: event.target.value,
                        }))
                      }
                      placeholder="First name"
                      className="h-11 rounded-2xl bg-[#f7f3e8] text-slate-900 ring-0 focus-visible:ring-2 focus-visible:ring-yellow-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold text-slate-800" htmlFor="vendor-last">
                      Last name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="vendor-last"
                      value={personalForm.lastName}
                      onChange={(event) =>
                        setPersonalForm((prev) => ({
                          ...prev,
                          lastName: event.target.value,
                        }))
                      }
                      placeholder="Last name"
                      className="h-11 rounded-2xl bg-[#f7f3e8] text-slate-900 ring-0 focus-visible:ring-2 focus-visible:ring-yellow-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold text-slate-800" htmlFor="vendor-email">
                      Email<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="vendor-email"
                      value={user?.email ?? ""}
                      disabled
                      className="h-11 rounded-2xl bg-[#f7f3e8] text-slate-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold text-slate-800" htmlFor="vendor-phone">
                      Phone number<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="vendor-phone"
                      type="tel"
                      value={personalForm.phone}
                      onChange={(event) =>
                        setPersonalForm((prev) => ({
                          ...prev,
                          phone: event.target.value,
                        }))
                      }
                      placeholder="+000 000-000 00"
                      className="h-11 rounded-2xl bg-[#f7f3e8] text-slate-900 ring-0 focus-visible:ring-2 focus-visible:ring-yellow-400"
                    />
                  </div>
                </div>

                  <div className="mt-6 flex justify-end">
                  <Button
                    className="rounded-full bg-slate-900 px-6 py-3 text-sm shadow-none"
                    disabled={
                      !(isPersonalDirty || pendingAvatarFile) ||
                      isUpdatingProfile ||
                      isSavingProfile
                    }
                    onClick={handleSaveProfile}
                    >
                      {isUpdatingProfile || isSavingProfile
                        ? "Saving..."
                        : "Save Changes"}
                  </Button>
                </div>
                </div>
              </>
            ) : null}

            {activeSection === "security" ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                  Strong passwords help keep your booking and payout data safe.
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {[
                    { label: "Current password", field: "currentPassword" },
                    { label: "New password", field: "newPassword" },
                    { label: "Confirm password", field: "confirmPassword" },
                  ].map(({ label, field }) => (
                    <div className="space-y-1" key={field}>
                      <Label htmlFor={`vendor-${field}`}>{label}</Label>
                      <div className="relative">
                        <Input
                          id={`vendor-${field}`}
                          type={showPassword[field as keyof typeof showPassword] ? "text" : "password"}
                          value={passwordForm[field as keyof typeof passwordForm]}
                          className="pr-12"
                          onChange={(event) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              [field]: event.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((prev) => ({
                              ...prev,
                              [field]: !prev[field as keyof typeof prev],
                            }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          aria-label={showPassword[field as keyof typeof showPassword] ? "Hide password" : "Show password"}
                        >
                          {showPassword[field as keyof typeof showPassword] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {passwordError ? (
                  <p className="text-xs font-semibold text-red-600">
                    {passwordError}
                  </p>
                ) : null}
                <div className="flex justify-end">
                  <Button
                    className="rounded-full bg-slate-900 px-6 py-3 text-sm shadow-none"
                    disabled={!isPasswordValid || isChangingPassword}
                    onClick={handlePasswordSubmit}
                  >
                    {isChangingPassword ? "Saving..." : "Change password"}
                  </Button>
                </div>
              </div>
            ) : null}

            {activeSection === "preferences" ? (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="vendor-language">Language</Label>
                    <Select
                      value={preferences.language}
                      onValueChange={(value) =>
                        setPreferences((prev) => ({ ...prev, language: value }))
                      }
                    >
                      <SelectTrigger id="vendor-language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languageOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="vendor-timezone">Time zone</Label>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <HiOutlineGlobeAlt className="h-4 w-4 text-slate-400" />
                      <Input
                        id="vendor-timezone"
                        value={preferences.timezone}
                        onChange={(event) =>
                          setPreferences((prev) => ({
                            ...prev,
                            timezone: event.target.value,
                          }))
                        }
                        className="border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Notification preferences
                  </p>
                  {[
                    {
                      key: "productUpdates",
                      title: "Product updates",
                      description:
                        "Release notes, improvements, and new vendor tools.",
                      icon: Timer,
                    },
                    {
                      key: "marketingEmails",
                      title: "Marketing tips",
                      description:
                        "Occasional playbooks to improve conversion and leads.",
                      icon: Languages,
                    },
                  ].map((pref) => {
                    const Icon = pref.icon;
                    return (
                      <div
                        key={pref.key}
                        className="flex items-center justify-between gap-4 rounded-xl border border-white bg-white px-4 py-3 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {pref.title}
                            </p>
                            <p className="text-xs text-slate-500">
                              {pref.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={
                            preferences[
                              pref.key as keyof typeof preferences
                            ] as boolean
                          }
                          onCheckedChange={(checked) =>
                            setPreferences((prev) => ({
                              ...prev,
                              [pref.key]: checked,
                            }))
                          }
                        />
                      </div>
                    );
                  })}
                  <p className="text-xs text-slate-500">
                    These preferences are stored on this device for now.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>


    </DashboardContainer>
  );
};

export default VendorSettings;
