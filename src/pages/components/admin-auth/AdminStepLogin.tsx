import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col gap-4">
      {/* Email */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-800">Admin Email</Label>
        <Input
          type="email"
          className="h-12 rounded-lg border border-slate-200 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-[#0b59a2]/30 focus-visible:border-[#0b59a2]"
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
        <Input
          type="password"
          className="h-12 rounded-lg border border-slate-200 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-[#0b59a2]/30 focus-visible:border-[#0b59a2]"
          placeholder="********"
          {...register("password")}
        />
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
