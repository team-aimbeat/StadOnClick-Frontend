import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { StaffRole, StaffStatus, StaffUser, StaffUserRole } from "@/features/admin/staff/adminStaff.types";
import { EllipsisVertical, ShieldCheck } from "lucide-react";

type StaffTableProps = {
  data?: StaffUser[];
  loading?: boolean;
  isRefreshing?: boolean;
  onEnable: (staff: StaffUser) => void;
  onRequestDisable: (staff: StaffUser) => void;
  onChangeRole: (staff: StaffUser, role: StaffRole) => void;
  statusUpdatingId?: string | null;
  roleUpdatingId?: string | null;
};

const statusTone: Record<StaffStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DISABLED: "bg-rose-50 text-rose-700 border-rose-200",
};

const roleLabel: Record<StaffUserRole, string> = {
  ADMIN: "Admin",
  SUPPORT_ADMIN: "Support Admin",
  MODERATOR: "Moderator",
};

const roleTone: Record<StaffUserRole, string> = {
  ADMIN: "bg-amber-50 text-amber-700 border-amber-200",
  SUPPORT_ADMIN: "bg-sky-50 text-sky-700 border-sky-200",
  MODERATOR: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

function formatDate(value?: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function StaffTable({
  data,
  loading,
  isRefreshing,
  onEnable,
  onRequestDisable,
  onChangeRole,
  statusUpdatingId,
  roleUpdatingId,
}: StaffTableProps) {
  const rows = data ?? [];
  const showSkeleton = loading && !rows.length;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm text-slate-600">
        <p className="font-medium text-slate-900">Staff</p>
        {isRefreshing ? (
          <span className="text-xs text-slate-500">Refreshing...</span>
        ) : (
          <span className="text-xs text-slate-500">Manage roles and status</span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/70">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Roles</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {showSkeleton && (
              <>
                {[...Array(5)].map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-14 rounded-full" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Skeleton className="ml-auto h-8 w-10 rounded-md" />
                    </td>
                  </tr>
                ))}
              </>
            )}

            {!showSkeleton && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                  No staff found.
                </td>
              </tr>
            )}

            {!showSkeleton &&
              rows.map((staff) => {
                const isStatusLoading = statusUpdatingId === staff.id;
                const isRoleLoading = roleUpdatingId === staff.id;
                const isAdminAccount = staff.roles.includes("ADMIN");

                return (
                  <tr key={staff.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col">
                        <p className="font-semibold text-slate-900">
                          {[staff.firstName, staff.lastName].filter(Boolean).join(" ") ||
                            "Unnamed"}
                        </p>
                        <p className="text-xs text-slate-500">{staff.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="text-sm font-medium text-slate-800">{staff.email}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        {staff.roles.map((role) => (
                          <Badge
                            key={role}
                            variant="outline"
                            className={cn(roleTone[role], "border")}
                          >
                            <ShieldCheck className="h-3 w-3" />
                            {roleLabel[role]}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={cn("border px-3 py-1", statusTone[staff.status])}
                        >
                          {staff.status === "ACTIVE" ? "Active" : "Disabled"}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={staff.status === "ACTIVE"}
                            disabled={isStatusLoading || isAdminAccount}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                onEnable(staff);
                              } else {
                                onRequestDisable(staff);
                              }
                            }}
                            aria-label={`Toggle status for ${staff.email}`}
                          />
                          <span className="text-xs text-slate-500">
                            {staff.status === "ACTIVE" ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="text-sm font-medium text-slate-800">
                        {formatDate(staff.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-slate-600 hover:text-slate-900"
                              aria-label="Open actions"
                            >
                              <EllipsisVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              disabled={isStatusLoading || isAdminAccount}
                              onClick={() =>
                                staff.status === "ACTIVE"
                                  ? onRequestDisable(staff)
                                  : onEnable(staff)
                              }
                            >
                              {staff.status === "ACTIVE" ? "Disable account" : "Enable account"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled={isRoleLoading || isAdminAccount}
                              onClick={() => onChangeRole(staff, "SUPPORT_ADMIN")}
                            >
                              Set role to Support Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={isRoleLoading || isAdminAccount}
                              onClick={() => onChangeRole(staff, "MODERATOR")}
                            >
                              Set role to Moderator
                            </DropdownMenuItem>
                            {isAdminAccount && (
                              <DropdownMenuItem disabled className="text-xs text-slate-500">
                                Admin accounts cannot be modified here
                              </DropdownMenuItem>
                            )}
                            {isRoleLoading && (
                              <DropdownMenuItem disabled className="text-xs text-slate-500">
                                Updating...
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StaffTable;
