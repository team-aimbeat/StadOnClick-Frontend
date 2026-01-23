import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { StaffRole } from "@/features/admin/staff/adminStaff.types";

export type CreateStaffFormValues = {
  email: string;
  firstName: string;
  lastName?: string;
  password: string;
  role: StaffRole;
};

type CreateStaffDialogProps = {
  open: boolean;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateStaffFormValues) => Promise<void> | void;
};

const defaultValues: CreateStaffFormValues = {
  email: "",
  firstName: "",
  lastName: "",
  password: "",
  role: "SUPPORT_ADMIN",
};

export function CreateStaffDialog({
  open,
  loading,
  onOpenChange,
  onSubmit,
}: CreateStaffDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateStaffFormValues>({
    defaultValues,
    mode: "onBlur",
  });

  const submitting = loading || isSubmitting;

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
    }
  }, [open, reset]);

  const handleClose = (nextOpen: boolean) => {
    if (submitting) return;
    onOpenChange(nextOpen);
  };

  const submitForm = async (values: CreateStaffFormValues) => {
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create staff</DialogTitle>
          <DialogDescription>
            Create an account for support admins or moderators. They will sign in using email
            and password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                placeholder="Alex"
                autoComplete="given-name"
                disabled={submitting}
                {...register("firstName", {
                  required: "First name is required",
                  minLength: { value: 2, message: "Enter at least 2 characters" },
                })}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                placeholder="Rivera"
                autoComplete="family-name"
                disabled={submitting}
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@company.com"
              autoComplete="email"
              disabled={submitting}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                disabled={submitting}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters" },
                  validate: {
                    hasUppercase: (value) =>
                      /[A-Z]/.test(value) || "Password must contain an uppercase letter",
                    hasNumber: (value) =>
                      /\d/.test(value) || "Password must contain a number",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded-md px-2 text-slate-500 transition hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-slate-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
            <p className="text-xs text-slate-500">
              Use at least 8 characters with 1 uppercase letter and 1 number.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Controller
              name="role"
              control={control}
              rules={{ required: "Role is required" }}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPPORT_ADMIN">Support Admin</SelectItem>
                    <SelectItem value="MODERATOR">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create staff"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateStaffDialog;
