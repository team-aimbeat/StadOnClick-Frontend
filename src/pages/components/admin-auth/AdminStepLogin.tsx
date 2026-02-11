import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

type Props = {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  onSubmit?: () => void;
  loading?: boolean;
  errorMessage?: string;
  isValid?: boolean;
  emailLabel?: string;
  emailPlaceholder?: string;
  passwordPlaceholder?: string;
  portalName?: string;
};

export function AdminStepLogin({
  register,
  errors,
  onSubmit,
  loading = false,
  errorMessage,
  isValid = false,
  emailLabel = "Admin Email",
  emailPlaceholder = "admin@stadonclick.com",
  passwordPlaceholder = "Enter your password",
  portalName = "Admin Portal",
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const loginInputClassName =
    "h-12 rounded-lg border border-slate-300 bg-white px-4 py-0 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:border-[#0b59a2] focus-visible:ring-2 focus-visible:ring-[#0b59a2]/20";

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col gap-4">
      {/* Email */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-800">{emailLabel}</Label>
        <Input
          type="email"
          className={loginInputClassName}
          placeholder={emailPlaceholder}
          autoComplete="email"
          {...register("email")}
        />
        {errors.email?.message ? (
          <p className="text-sm text-red-600">{String(errors.email.message)}</p>
        ) : null}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-slate-800">Password</Label>
          <button
            type="button"
            className="text-xs font-semibold text-[#0b59a2] hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            className={`${loginInputClassName} pr-12`}
            placeholder={passwordPlaceholder}
            autoComplete="current-password"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded-md px-2 text-slate-500 transition hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-slate-200"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password?.message ? (
          <p className="text-sm text-red-600">{String(errors.password.message)}</p>
        ) : null}
      </div>

     
      {/* Error message */}
      <div className="min-h-[20px]">
        {errorMessage ? (
          <p className="text-sm text-red-600">{errorMessage}</p>
        ) : null}
      </div>

      {/* Submit */}
      <Button
        className="h-[52px] w-full max-w-[480px] mx-auto text-[16px]"
        disabled={!isValid || loading}
        onClick={onSubmit}
      >
        {loading ? "Signing in..." : "Continue"}
      </Button>

      {/* No social sign-in */}
      <div className="text-center text-xs text-slate-500">
        Social login is disabled for {portalName}.
      </div>
    </div>
  );
}
