import { memo } from "react";
import { Button } from "@/components/ui/button";
import type { FieldErrors } from "react-hook-form";
import { OnboardingRoleEnum } from "@/features/auth/types/basicProfile.types";

type Props = {
  role: string;
  onSelectRole: (role: OnboardingRoleEnum) => void;
  onBack?: () => void;
  onNext: () => void;
  loading?: boolean;
  errors: FieldErrors;
};

function StepRoleComponent({
  role,
  onSelectRole,
  onBack,
  onNext,
  loading = false,
  errors,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelectRole(OnboardingRoleEnum.USER)}
          className={`rounded-xl border p-4 text-left transition ${
            role === OnboardingRoleEnum.USER
              ? "border-[#3B82F6] bg-[#EFF6FF]"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <p className="text-sm font-semibold text-slate-900">User</p>
          <p className="mt-1 text-xs text-slate-500">Book services and manage your activities.</p>
        </button>

        <button
          type="button"
          onClick={() => onSelectRole(OnboardingRoleEnum.VENDOR)}
          className={`rounded-xl border p-4 text-left transition ${
            role === OnboardingRoleEnum.VENDOR
              ? "border-[#3B82F6] bg-[#EFF6FF]"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <p className="text-sm font-semibold text-slate-900">Vendor</p>
          <p className="mt-1 text-xs text-slate-500">List services and grow your business.</p>
        </button>
      </div>

      {errors.role?.message ? <p className="text-xs text-red-600">{String(errors.role.message)}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {onBack ? (
          <Button variant="outline" onClick={onBack} className="px-4">
            Back
          </Button>
        ) : (
          <span />
        )}
        <Button
          className="h-[52px] w-full sm:w-auto rounded-[10px] bg-[#3B82F6] px-6 text-white"
          disabled={!role || loading}
          onClick={onNext}
        >
          {loading ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}

export const StepRole = memo(StepRoleComponent);

