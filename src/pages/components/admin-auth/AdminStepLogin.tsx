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
};

export function AdminStepLogin({
  register,
  errors,
  onSubmit,
  loading = false,
  errorMessage,
  isValid = false,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col gap-4">
      {/* Email */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-800">Admin Email</Label>
        <Input
          type="email"
          className="h-12 rounded-lg border border-slate-200 py-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-[#0b59a2]/30 focus-visible:border-[#0b59a2]"
          placeholder="admin@stadonclick.com"
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
            className="h-12 rounded-lg border border-slate-200 py-3 pr-12 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-[#0b59a2]/30 focus-visible:border-[#0b59a2]"
            placeholder="********"
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
        Social login is disabled for Admin Portal.
      </div>
    </div>
  );
}
