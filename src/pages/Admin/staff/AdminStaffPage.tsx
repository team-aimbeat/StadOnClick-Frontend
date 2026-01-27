import { useCallback, useEffect, useMemo, useState } from "react";
import { Shield, Users, EllipsisVertical, ShieldCheck } from "lucide-react";
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

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import CreateStaffDialog, { CreateStaffFormValues } from "./components/CreateStaffDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ListingPage } from "@/components/shared/ListingPage";
import type { ColumnConfig, RowData } from "@/components/shared/DataTable";

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
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);

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

  type StaffRow = RowData & {
    id: string;
    name: string;
    email: string;
    roles: StaffRole[];
    status: StaffStatus;
    createdAt: string;
    raw: StaffUser;
  };

  const staffRows: StaffRow[] = useMemo(
    () =>
      staff.map((s) => ({
        id: s.id,
        name: [s.firstName, s.lastName].filter(Boolean).join(" ") || "Unnamed",
        email: s.email,
        roles: s.roles,
        status: s.status,
        createdAt: s.createdAt,
        raw: s,
      })),
    [staff],
  );

  const columns: ColumnConfig[] = useMemo(
    () => [
      {
        key: "name",
        title: "Name",
        render: (_value, row) => {
          const r = row as StaffRow;
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900">{r.name}</span>
              <span className="text-xs text-slate-500">{r.email}</span>
            </div>
          );
        },
      },
      {
        key: "roles",
        title: "Roles",
        render: (_value, row) => {
          const r = row as StaffRow;
          return (
            <div className="flex flex-wrap gap-2">
              {r.roles.map((role) => (
                <Badge
                  key={role}
                  variant="outline"
                  className={`border ${role === "SUPPORT_ADMIN" ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-indigo-50 text-indigo-700 border-indigo-200"}`}
                >
                  <ShieldCheck className="h-3 w-3" />
                  {role === "SUPPORT_ADMIN" ? "Support Admin" : "Moderator"}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        key: "status",
        title: "Status",
        render: (_value, row) => {
          const r = row as StaffRow;
          const isStatusLoading = statusUpdatingId === r.id;
          const tone =
            r.status === "ACTIVE"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200";

          return (
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`border px-3 py-1 ${tone}`}>
                {r.status === "ACTIVE" ? "Active" : "Disabled"}
              </Badge>
              <Switch
                checked={r.status === "ACTIVE"}
                disabled={isStatusLoading}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleEnable(r.raw);
                  } else {
                    handleRequestDisable(r.raw);
                  }
                }}
                aria-label={`Toggle status for ${r.email}`}
              />
            </div>
          );
        },
      },
      {
        key: "createdAt",
        title: "Created",
        render: (value) => (
          <span className="text-sm font-medium text-slate-800">
            {value
              ? new Date(String(value)).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })
              : "—"}
          </span>
        ),
        sortable: true,
      },
      {
        key: "actions",
        title: "Actions",
        render: (_value, row) => {
          const r = row as StaffRow;
          const isRoleLoading = roleUpdatingId === r.id;
          const isStatusLoading = statusUpdatingId === r.id;
          return (
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
                    disabled={isStatusLoading}
                    onClick={() =>
                      r.status === "ACTIVE" ? handleRequestDisable(r.raw) : handleEnable(r.raw)
                    }
                  >
                    {r.status === "ACTIVE" ? "Disable account" : "Enable account"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={isRoleLoading}
                    onClick={() => handleRoleChange(r.raw, "SUPPORT_ADMIN")}
                  >
                    Set role → Support Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={isRoleLoading}
                    onClick={() => handleRoleChange(r.raw, "MODERATOR")}
                  >
                    Set role → Moderator
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [handleEnable, handleRequestDisable, handleRoleChange, roleUpdatingId, statusUpdatingId],
  );

  return (
    <div className="space-y-6">
      <ListingPage
        title="Staff Management"
        breadCrumbTitle="Admin / Staff"
        description="Create and manage support agents and moderators."
        headerSlot={
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => refetch()}>
              Refresh
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Users className="h-4 w-4" />
              Create staff
            </Button>
          </div>
        }
        summary={{
          left: `Showing ${pageStart} - ${pageEnd} of ${total}`,
          right: isFetching ? "Updating..." : `Total staff: ${total}`,
        }}
        tableProps={{
          data: staffRows,
          columns,
          searchable: true,
          searchValue: searchTerm,
          onSearch: (term) => setSearchTerm(term),
          loading: isLoading,
          error: error ? "Unable to load staff" : null,
          onDismissError: () => {},
          controlledPagination: {
            page,
            pageSize: limit,
            totalPages,
            totalRecords: total,
          },
          onPaginationChange: ({ page: nextPage, pageSize }) => {
            setPage(nextPage);
            setLimit(pageSize);
          },
          defaultRowsPerPage: limit,
          sortOptions: [{ key: "createdAt", label: "Created date" }],
          defaultSortColumn: "createdAt",
          minHeight: 400,
        }}
      />

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
