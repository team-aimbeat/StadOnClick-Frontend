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
import { cn } from "@/lib/utils";
import { Eye, Lock, MapPin, Sparkles, User, Wallet } from "lucide-react";
import React from "react";
import { StepPersonalize } from "@/components/shared/user-onboarding/StepPersonalize";

type SectionKey = "personal" | "password" | "shipping" | "payment" | "personalization";

type NavigationItem = {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  section: SectionKey;
};

const navigation: NavigationItem[] = [
  { label: "Personal info", icon: User, section: "personal" },
  { label: "Change password", icon: Lock, section: "password" },
  { label: "Shipping addresses", icon: MapPin, section: "shipping" },
  { label: "Payment method", icon: Wallet, section: "payment" },
  { label: "Personalization", icon: Sparkles, section: "personalization" },
];

const sectionDescriptions: Record<SectionKey, string> = {
  personal: "Keep your account details up to date.",
  password: "Update your password to keep your account secure.",
  shipping: "Manage the addresses you typically ship to.",
  payment: "Review or edit your saved payment options.",
  personalization: "Manage your personalization preferences.",
};

const genderOptions = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "nonBinary", label: "Non-binary" },
  { value: "preferNotToSay", label: "Prefer not to say" },
];

const UserAccount = () => {
  const [gender, setGender] = React.useState("");
  const [activeSection, setActiveSection] = React.useState<SectionKey>("personal");
  const activeNavItem = navigation.find(
    (item) => item.section === activeSection
  );
  const [avatarPreview, setAvatarPreview] = React.useState<string>("");
  const avatarUrlRef = React.useRef<string | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (avatarUrlRef.current) {
        URL.revokeObjectURL(avatarUrlRef.current);
      }
      avatarUrlRef.current = url;
      setAvatarPreview(url);
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
          <div className="grid gap-8 lg:grid-cols-[260px,1fr]">
            <section className="rounded-3xl border border-slate-200 bg-white/60 p-4">
              <div className="px-1 pb-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                Account
              </div>
              <div className="space-y-2">
                {navigation.map((item) => {
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
                    />
                  </div>
                  <div className="mt-6 grid gap-6 lg:grid-cols-[repeat(2,minmax(0,1fr))]">
                    <div className="space-y-1">
                      <Label htmlFor="first-name">First name</Label>
                      <Input
                        id="first-name"
                        placeholder="Sahibjit"
                        defaultValue="Sahibjit"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="last-name">Last name</Label>
                      <Input
                        id="last-name"
                        placeholder="Singh"
                        defaultValue="Singh"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={gender} onValueChange={setGender}>
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
                    <div className="space-y-1">
                      <Label htmlFor="birthday">Birthday</Label>
                      <Input
                        id="birthday"
                        placeholder="YYYY/MM/DD"
                        type="text"
                      />
                    </div>
                  </div>
                  <div className="mt-6 space-y-1">
                    <Label htmlFor="phone-number">Phone number</Label>
                    <Input
                      id="phone-number"
                      placeholder="Recipient Phone Number"
                      type="tel"
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
                      defaultValue="sahibjitisinghramgharia@gmail.com"
                      disabled
                    />
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button className="rounded-full bg-slate-900 px-8 py-3 text-base shadow-none">
                      Save Changes
                    </Button>
                  </div>
                </>
              ) : activeSection === "password" ? (
                <div className="mt-6 space-y-5">
                  {["Current password", "New password", "Confirm password"].map(
                    (label, index) => (
                      <div className="space-y-1" key={label}>
                        <Label htmlFor={`password-${index}`}>{label}</Label>
                        <div className="relative">
                          <Input
                            id={`password-${index}`}
                            type="password"
                            placeholder=""
                            className="pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <Eye className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    )
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">Forgot Password?</p>
                    <Button className="rounded-full bg-slate-900 px-8 py-3 text-base shadow-none">
                      Change password
                    </Button>
                  </div>
                </div>
              ) : activeSection === "shipping" ? (
                <div className="mt-6 flex flex-col items-center justify-center gap-6 border-b border-slate-200 pb-6 text-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-white shadow-[0_20px_40px_rgba(15,15,15,0.08)]">
                    <MapPin className="h-6 w-6 text-slate-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-slate-900">
                      You have no address added
                    </p>
                    <p className="text-sm text-slate-500">
                      Add one to speed up future checkouts within Sweden.
                    </p>
                  </div>
                  <Button
                    className="rounded-full bg-slate-900 px-6 py-3 text-base shadow-none"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    + Add shipping address
                  </Button>
                  <AddShippingAddressDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
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
