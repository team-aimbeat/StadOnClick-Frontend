import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Shield, Users } from "lucide-react";
import { toast } from "react-hot-toast";

import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import {
  useCreateAdminStaffMutation,
  useGetAdminStaffQuery,
  useUpdateAdminStaffRolesMutation,
  useUpdateAdminStaffStatusMutation,
} from "@/features/admin/staff/adminStaffApi";
import type {
  StaffRole,
  StaffStatus,
  StaffUser,
} from "@/features/admin/staff/adminStaff.types";
import { normalizeApiError } from "@/shared/utils/normalizeApiError";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import CreateStaffDialog, { CreateStaffFormValues } from "./components/CreateStaffDialog";
import StaffTable from "./components/StaffTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SEARCH_DEBOUNCE_MS = 400;
const DEFAULT_PAGE_SIZE = 10;

function getErrorMessage(error: unknown, fallback: string) {
  return normalizeApiError(error, fallback).toastMessage;
}

export default function AdminStaffPage() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setPageTitle("Staff Management"));
  }, [dispatch]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = DEFAULT_PAGE_SIZE;

  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
  const [confirmingStaff, setConfirmingStaff] = useState<StaffUser | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(searchTerm.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAdminStaffQuery(
    { q: debouncedSearch || undefined, page, limit },
    { refetchOnMountOrArgChange: true },
  );

  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error, "Unable to load staff."));
    }
  }, [error]);

  const staff = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const pageEnd = Math.min(page * limit, total);

  const [createStaff, { isLoading: isCreating }] = useCreateAdminStaffMutation();
  const [updateStatus] = useUpdateAdminStaffStatusMutation();
  const [updateRoles] = useUpdateAdminStaffRolesMutation();

  const handleCreateStaff = useCallback(
    async (values: CreateStaffFormValues) => {
      try {
        await createStaff(values).unwrap();
        toast.success("Staff created");
        setIsCreateOpen(false);
        setPage(1);
      } catch (err) {
        toast.error(getErrorMessage(err, "Unable to create staff."));
        // Keep dialog open for fixes
      }
    },
    [createStaff],
  );

  const handleStatusChange = useCallback(
    async (staffUser: StaffUser, nextStatus: StaffStatus) => {
      setStatusUpdatingId(staffUser.id);
      try {
        await updateStatus({ id: staffUser.id, body: { status: nextStatus } }).unwrap();
        toast.success(
          nextStatus === "ACTIVE" ? "Staff enabled" : "Staff disabled and logged out.",
        );
        setConfirmingStaff(null);
      } catch (err) {
        toast.error(getErrorMessage(err, "Unable to update status."));
      } finally {
        setStatusUpdatingId(null);
      }
    },
    [updateStatus],
  );

  const handleRoleChange = useCallback(
    async (staffUser: StaffUser, role: StaffRole) => {
      setRoleUpdatingId(staffUser.id);
      try {
        await updateRoles({ id: staffUser.id, body: { roles: [role] } }).unwrap();
        toast.success(`Role updated to ${role === "SUPPORT_ADMIN" ? "Support Admin" : "Moderator"}`);
      } catch (err) {
        toast.error(getErrorMessage(err, "Unable to update role."));
      } finally {
        setRoleUpdatingId(null);
      }
    },
    [updateRoles],
  );

  const handleRequestDisable = useCallback((staffUser: StaffUser) => {
    setConfirmingStaff(staffUser);
  }, []);

  const handleConfirmDisable = useCallback(() => {
    if (!confirmingStaff) return;
    void handleStatusChange(confirmingStaff, "DISABLED");
  }, [confirmingStaff, handleStatusChange]);

  const handleEnable = useCallback(
    (staffUser: StaffUser) => {
      void handleStatusChange(staffUser, "ACTIVE");
    },
    [handleStatusChange],
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
          <Shield className="h-4 w-4 text-blue-500" />
          Administration
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Staff Management</h1>
            <p className="text-sm text-slate-600">
              Create and manage support agents and moderators.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => refetch()}>
              Refresh
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Users className="h-4 w-4" />
              Create staff
            </Button>
          </div>
        </div>
      </div>

      <Card className="gap-4">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">Directory</CardTitle>
          <CardDescription>
            Use search to find staff by name or email. Status and role changes take effect
            immediately.
          </CardDescription>
          <CardAction>
            <div className="text-right text-xs text-slate-500">
              {isFetching ? "Updating..." : `Total staff: ${total}`}
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full max-w-xl items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus-within:ring-2 focus-within:ring-blue-100">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="border-0 p-0 shadow-none focus-visible:ring-0"
              />
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Page</p>
                <p className="font-semibold text-slate-900">
                  {page}/{totalPages || 1}
                </p>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canGoPrev}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canGoNext}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>

          <StaffTable
            data={staff}
            loading={isLoading}
            isRefreshing={isFetching && !isLoading}
            onEnable={handleEnable}
            onRequestDisable={handleRequestDisable}
            onChangeRole={handleRoleChange}
            statusUpdatingId={statusUpdatingId}
            roleUpdatingId={roleUpdatingId}
          />

          <div className="flex flex-col gap-2 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
            <span>
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {pageStart} - {pageEnd}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">{total}</span>
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Real-time updates after every change.
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateStaffDialog
        open={isCreateOpen}
        loading={isCreating}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateStaff}
      />

      <Dialog
        open={Boolean(confirmingStaff)}
        onOpenChange={(open) => {
          if (!open) setConfirmingStaff(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable this staff member?</DialogTitle>
            <DialogDescription>
              They will be logged out immediately and lose access to admin tools.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-slate-700">
            <p className="font-semibold">
              {confirmingStaff
                ? `${confirmingStaff.firstName} ${confirmingStaff.lastName ?? ""}`.trim() ||
                  confirmingStaff.email
                : ""}
            </p>
            <p className="text-slate-500">
              You can re-enable access at any time from the actions menu.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              disabled={statusUpdatingId === confirmingStaff?.id}
              onClick={() => setConfirmingStaff(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={statusUpdatingId === confirmingStaff?.id}
              onClick={handleConfirmDisable}
            >
              {statusUpdatingId === confirmingStaff?.id ? "Disabling..." : "Disable staff"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
