import { useCallback, useMemo, useState } from "react";
import { Copy, Pencil, Power, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import type { ColumnConfig, DataTableSortStatus, RowData } from "@/components/shared/DataTable";
import { ListingPage } from "@/components/shared/ListingPage";
import type { ActionConfig } from "@/types/Table/action";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import LeadPlanFormDialog, { LeadPlanFormValues } from "./components/LeadPlanFormDialog";
import ConfirmToggleDialog from "./components/ConfirmToggleDialog";
import ConfirmDeleteDialog from "./components/ConfirmDeleteDialog";
import { 
  useCreateLeadPlanMutation,
  useListLeadPlansQuery,
  useUpdateLeadPlanMutation,
  useDeleteLeadPlanMutation,
} from "@/features/adminLeads/api/adminLeadPlans.api";
import type { LeadPlan, LeadPlanTier } from "@/features/adminLeads/types/leadPlans.types";
import { Button } from "@/components/ui/button";

const PLAN_TIERS: LeadPlanTier[] = ["BASIC", "PRO", "UNLIMITED"];
const SORT_WEIGHT = 1_000_000_000_000;
const TIER_PRIORITY: Record<LeadPlanTier, number> = {
  BASIC: 1,
  PRO: 2,
  UNLIMITED: 3,
};
const TIER_WEIGHT: Record<LeadPlanTier, number> = {
  BASIC: 3,
  PRO: 2,
  UNLIMITED: 1,
};
const PLAN_BADGE_CLASSES: Record<LeadPlanTier, string> = {
  BASIC: "border-slate-300 bg-slate-100 text-slate-700",
  PRO: "border-amber-200 bg-amber-100 text-amber-700",
  UNLIMITED: "border-emerald-200 bg-emerald-100 text-emerald-700",
};

type LeadPlanRow = LeadPlan & {
  price: number;
  leadsPerDay: number;
  durationDays: number;
  createdAtSortValue: number;
  priceSortValue: number;
  leadsPerDaySortValue: number;
  tierWeight: number;
};

const formatCurrency = (value: number, currency?: string) => {
  const resolvedCurrency = currency || "SEK";
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: resolvedCurrency,
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(value);
};

const getErrorMessage = (error: unknown): string | null => {
  if (!error) return null;
  if (typeof error === "string") return error;
  if ("status" in (error as FetchBaseQueryError)) {
    const err = error as FetchBaseQueryError;
    if (err.data) {
      if (typeof err.data === "string") {
        return err.data;
      }
      if (typeof (err.data as any).message === "string") {
        return (err.data as any).message;
      }
    }
    return `Request failed (${err.status})`;
  }
  if (error instanceof Error) return error.message;
  if (typeof (error as any).message === "string") {
    return (error as any).message;
  }
  return null;
};

export default function LeadPlansPage() {
  const {
    data: leadPlans = [],
    isLoading: isPlansLoading,
    isFetching,
    error: listError,
  } = useListLeadPlansQuery();
  const [createLeadPlan, { isLoading: isCreating }] = useCreateLeadPlanMutation();
  const [updateLeadPlan, { isLoading: isUpdating }] = useUpdateLeadPlanMutation();
  const [deleteLeadPlan, { isLoading: isDeleting }] = useDeleteLeadPlanMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [activePlan, setActivePlan] = useState<LeadPlan | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDeactivatePlan, setPendingDeactivatePlan] = useState<LeadPlan | null>(null);
  const [pendingDeletePlan, setPendingDeletePlan] = useState<LeadPlan | null>(null);

  const loading = isPlansLoading || isFetching;
  const planErrorMessage = listError ? getErrorMessage(listError) : null;

  const existingPlanNames = useMemo(() => {
    return Array.from(new Set(leadPlans.map((plan) => plan.name)));
  }, [leadPlans]);
  const allTiersCreated = PLAN_TIERS.every((tier) => existingPlanNames.includes(tier));

  const totalPlans = leadPlans.length;
  const activePlans = leadPlans.filter((plan) => plan.isActive).length;
  const inactivePlans = totalPlans - activePlans;
  const totalLeadsPerDay = leadPlans.reduce(
    (sum, plan) => sum + Number(plan.leadsPerDay ?? 0),
    0
  );
  const avgLeadsPerDay = totalPlans ? Math.round(totalLeadsPerDay / totalPlans) : 0;

  const stats = useMemo(
    () => [
      {
        title: "Total Plans",
        value: totalPlans,
        subtitle: `${inactivePlans} inactive`,
        accentColor: "cyan" as const,
      },
      {
        title: "Active Plans",
        value: activePlans,
        subtitle: `${activePlans} published`,
        accentColor: "green" as const,
      },
      {
        title: "Inactive Plans",
        value: inactivePlans,
        subtitle: `${inactivePlans} hidden`,
        accentColor: "yellow" as const,
      },
      {
        title: "Avg Leads/Day",
        value: avgLeadsPerDay,
        subtitle: `${totalLeadsPerDay} total`,
        accentColor: "purple" as const,
      },
    ],
    [totalPlans, activePlans, inactivePlans, avgLeadsPerDay, totalLeadsPerDay]
  );

  const processedPlans = useMemo<LeadPlanRow[]>(() => {
    return [...leadPlans]
      .map((plan) => {
        const price = Number(plan.price ?? 0);
        const leadsPerDay = Number(plan.leadsPerDay ?? 0);
        const durationDays = Number(plan.durationDays ?? 0);
        const tierWeight = TIER_WEIGHT[plan.name] ?? 0;
        const createdAtTimestamp = plan.createdAt
          ? new Date(plan.createdAt).getTime()
          : 0;

        return {
          ...plan,
          price,
          leadsPerDay,
          durationDays,
          tierWeight,
          createdAtSortValue: tierWeight * SORT_WEIGHT + createdAtTimestamp,
          priceSortValue: tierWeight * SORT_WEIGHT + price,
          leadsPerDaySortValue: tierWeight * SORT_WEIGHT + leadsPerDay,
        };
      })
      .sort((a, b) => TIER_PRIORITY[a.name] - TIER_PRIORITY[b.name]);
  }, [leadPlans]);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAtSortValue",
    direction: "desc",
  });

  const editInitialValues = useMemo<LeadPlanFormValues | undefined>(() => {
    if (!activePlan) return undefined;
    return {
      name: activePlan.name,
      price: Number(activePlan.price ?? 0),
      currency: activePlan.currency ?? "SEK",
      leadsPerDay: Number(activePlan.leadsPerDay ?? 0),
      durationDays: Number(activePlan.durationDays ?? 0),
      maxConcurrentLeads:
        activePlan.maxConcurrentLeads !== null &&
        typeof activePlan.maxConcurrentLeads !== "undefined"
          ? Number(activePlan.maxConcurrentLeads)
          : undefined,
      isActive: activePlan.isActive,
    };
  }, [activePlan]);

  const handleOpenCreate = useCallback(() => {
    if (allTiersCreated) return;
    setFormMode("create");
    setActivePlan(null);
    setFormError(null);
    setIsFormOpen(true);
  }, [allTiersCreated]);

  const handleOpenEdit = useCallback((plan: LeadPlan) => {
    setFormMode("edit");
    setActivePlan(plan);
    setFormError(null);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setActivePlan(null);
    setFormError(null);
  }, []);

  const handleCreatePlan = useCallback(
    async (values: LeadPlanFormValues) => {
      try {
        await createLeadPlan(values).unwrap();
        toast.success("Plan created successfully");
        closeForm();
      } catch (error) {
        const message = getErrorMessage(error) ?? "Unable to create plan.";
        setFormError(message);
        toast.error(message);
      }
    },
    [createLeadPlan, closeForm]
  );

  const handleUpdatePlan = useCallback(
    async (values: LeadPlanFormValues) => {
      if (!activePlan) return;
      try {
        await updateLeadPlan({
          id: activePlan.id,
          body: {
            price: values.price,
            currency: values.currency,
            leadsPerDay: values.leadsPerDay,
            durationDays: values.durationDays,
            maxConcurrentLeads:
              values.maxConcurrentLeads ?? undefined,
            isActive: values.isActive,
          },
        }).unwrap();
        toast.success("Lead plan updated");
        closeForm();
      } catch (error) {
        const message = getErrorMessage(error) ?? "Unable to update plan.";
        setFormError(message);
        toast.error(message);
      }
    },
    [activePlan, updateLeadPlan, closeForm]
  );

  const handleFormSubmit = useCallback(
    (values: LeadPlanFormValues) => {
      if (formMode === "create") {
        void handleCreatePlan(values);
        return;
      }

      void handleUpdatePlan(values);
    },
    [formMode, handleCreatePlan, handleUpdatePlan]
  );

  const applyToggleState = useCallback(
    async (plan: LeadPlan, nextState: boolean) => {
      try {
        await updateLeadPlan({
          id: plan.id,
          body: { isActive: nextState },
        }).unwrap();
        toast.success(
          nextState ? "Plan activated" : "Plan deactivated"
        );
      } catch (error) {
        const message = getErrorMessage(error) ?? "Unable to change activation.";
        toast.error(message);
      } finally {
        setPendingDeactivatePlan(null);
      }
    },
    [updateLeadPlan]
  );

  const handleTogglePlan = useCallback(
    (plan: LeadPlan) => {
      if (plan.isActive) {
        setPendingDeactivatePlan(plan);
        return;
      }
      void applyToggleState(plan, true);
    },
    [applyToggleState]
  );

  const handleConfirmDeactivate = useCallback(() => {
    if (!pendingDeactivatePlan) return;
    void applyToggleState(pendingDeactivatePlan, false);
  }, [pendingDeactivatePlan, applyToggleState]);

  const handleDeletePlan = useCallback(
    async (plan: LeadPlan) => {
      try {
        await deleteLeadPlan({ id: plan.id }).unwrap();
        toast.success("Lead plan deleted");
        setPendingDeletePlan(null);
      } catch (error) {
        const message = getErrorMessage(error) ?? "Unable to delete plan.";
        toast.error(message);
      }
    },
    [deleteLeadPlan]
  );

  const ToggleActionButton = useCallback(
    ({ row }: { row: LeadPlanRow }) => {
      const isActive = row.isActive;
      const buttonClasses = isActive
        ? "hover:bg-rose-50 text-rose-600 hover:text-rose-700 focus-visible:ring-rose-200"
        : "hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 focus-visible:ring-emerald-200";
      const iconClasses = isActive
        ? "text-rose-600 group-hover:text-rose-700"
        : "text-emerald-600 group-hover:text-emerald-700";

      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleTogglePlan(row);
          }}
          title={isActive ? "Deactivate plan" : "Activate plan"}
          aria-label={isActive ? "Deactivate plan" : "Activate plan"}
          className={`group inline-flex items-center justify-center rounded-full p-2 transition-all duration-150 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 ${buttonClasses}`}
        >
          <Power className={`h-4 w-4 transition-colors ${iconClasses}`} />
        </button>
      );
    },
    [handleTogglePlan]
  );

  const handleCopyPlanId = useCallback(async (plan: LeadPlan) => {
    try {
      if (!navigator?.clipboard) {
        toast.error("Clipboard is not available");
        return;
      }
    await navigator.clipboard.writeText(plan.planId ?? plan.id);
      toast.success("Plan ID copied");
    } catch (error) {
      toast.error("Unable to copy plan ID");
    }
  }, []);

  const columns = useMemo<ColumnConfig[]>(() => {
    const renderRow = (row: RowData): LeadPlanRow => row as LeadPlanRow;

    return [
      {
        key: "name",
        title: "Plan",
        render: (_value, row) => {
      const planRow = renderRow(row);
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">{planRow.name}</p>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                PLAN_BADGE_CLASSES[planRow.name]
              }`}
            >
              {planRow.name === "PRO" ? "Popular" : planRow.name}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Plan ID {planRow.planId ?? planRow.id}
          </p>
        </div>
      );
        },
      },
      {
        key: "priceSortValue",
        title: "Price",
        render: (_value, row) => {
          const planRow = renderRow(row);
          const currencyLabel = planRow.currency || "SEK";
          return (
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {formatCurrency(planRow.price, currencyLabel)}
              </p>
              <p className="text-xs uppercase text-slate-500">{currencyLabel}</p>
            </div>
          );
        },
      },
      {
        key: "leadsPerDaySortValue",
        title: "Leads/Day",
        render: (_value, row) => {
          const planRow = renderRow(row);
          return (
            <p className="text-sm font-semibold text-slate-900">
              {planRow.leadsPerDay?.toLocaleString()} / day
            </p>
          );
        },
      },
      {
        key: "durationDays",
        title: "Duration",
        render: (_value, row) => {
          const planRow = renderRow(row);
          return <p className="text-sm text-slate-900">{planRow.durationDays} days</p>;
        },
      },
      {
        key: "maxConcurrentLeads",
        title: "Concurrent Leads",
        render: (_value, row) => {
          const planRow = renderRow(row);
          return (
            <p className="text-sm text-slate-900">
              {typeof planRow.maxConcurrentLeads === "number" ? planRow.maxConcurrentLeads : "Unlimited"}
            </p>
          );
        },
      },
      {
        key: "isActive",
        title: "Status",
        render: (_value, row) => {
          const planRow = renderRow(row);
          return (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                planRow.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
              }`}
            >
              {planRow.isActive ? "Active" : "Inactive"}
            </span>
          );
        },
        sortable: false,
      },
      {
        key: "createdAtSortValue",
        title: "Created",
        render: (_value, row) => {
          const planRow = renderRow(row);
          const parsed = planRow.createdAt ? new Date(planRow.createdAt) : null;
          return (
            <p className="text-sm text-slate-900">
              {parsed ? parsed.toLocaleDateString() : "—"}
            </p>
          );
        },
      },
    ];
  }, []);

  const sortOptions = useMemo(
    () => [
      { key: "createdAtSortValue", label: "Created At (newest first)" },
      { key: "priceSortValue", label: "Price (low to high)" },
      { key: "priceSortValue", label: "Price (high to low) desc" },
      { key: "leadsPerDaySortValue", label: "Leads/Day (low to high)" },
      { key: "leadsPerDaySortValue", label: "Leads/Day (high to low) desc" },
    ],
    []
  );

  const tableActions = useMemo<ActionConfig<LeadPlanRow>[]>(
    () => [
      {
        title: "Edit plan",
        icon: Pencil,
        onClick: (row) => handleOpenEdit(row),
      },
      {
        title: "Toggle activation",
        component: ToggleActionButton,
      },
      {
        title: "Copy plan ID",
        icon: Copy,
        onClick: (row) => void handleCopyPlanId(row),
      },
      {
        title: "Delete plan",
        icon: Trash2,
        tone: "danger",
        onClick: (row) => setPendingDeletePlan(row),
      },
    ],
    [handleOpenEdit, ToggleActionButton, handleCopyPlanId]
  );

  const summarySlot = (
    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
      <span>
        Total plans <span className="font-semibold text-slate-900">{totalPlans}</span>
      </span>
      <span>
        Active <span className="font-semibold text-slate-900">{activePlans}</span>
      </span>
      <span>
        Inactive <span className="font-semibold text-slate-900">{inactivePlans}</span>
      </span>
    </div>
  );

  const headerSlot = (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <Button
        onClick={handleOpenCreate}
        disabled={allTiersCreated}
        title={allTiersCreated ? "All plan tiers already exist" : undefined}
      >
        Create Plan
      </Button>
      <p className="text-sm text-slate-500">
        Only one plan per tier (BASIC / PRO / UNLIMITED).
      </p>
    </div>
  );

  return (
    <>
      <ListingPage
        title="Lead Plans"
        breadCrumbTitle="Leads & Monetization"
        description="Manage vendor lead subscription plans (pricing, limits, and activation)."
        headerSlot={headerSlot}
        summarySlot={summarySlot}
        stats={stats}
        tableProps={{
          data: processedPlans,
          columns,
          loading,
          error: planErrorMessage,
          noRecordText: "No lead plans found. Create your first plan.",
          searchable: true,
          selectable: false,
          showSerialNumber: false,
          rowsPerPageOptions: [10, 25, 50],
          defaultRowsPerPage: 10,
          minHeight: 360,
          sortOptions,
          sortStatus,
          onSort: setSortStatus,
          actions: tableActions,
          searchPlaceholder: "Search plans, currency, or price...",
        }}
      />

      <LeadPlanFormDialog
        mode={formMode}
        isOpen={isFormOpen}
        loading={formMode === "create" ? isCreating : isUpdating}
        error={formError}
        existingPlanNames={existingPlanNames}
        initialValues={editInitialValues}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
      />

      <ConfirmToggleDialog
        isOpen={Boolean(pendingDeactivatePlan)}
        planName={pendingDeactivatePlan?.name}
        loading={isUpdating && Boolean(pendingDeactivatePlan)}
        onClose={() => setPendingDeactivatePlan(null)}
        onConfirm={handleConfirmDeactivate}
      />
      {pendingDeletePlan && (
        <ConfirmDeleteDialog
          isOpen={Boolean(pendingDeletePlan)}
          planName={pendingDeletePlan.name}
          loading={isDeleting && Boolean(pendingDeletePlan)}
          onClose={() => setPendingDeletePlan(null)}
          onConfirm={() => {
            if (pendingDeletePlan) {
              void handleDeletePlan(pendingDeletePlan);
            }
          }}
        />
      )}
    </>
  );
}
