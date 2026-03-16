import { useCallback, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Calendar, CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";

import { ListingPage } from "@/components/shared/ListingPage";
import { Button } from "@/components/ui/button";
import type { ColumnConfig, DataTableSortStatus, RowData } from "@/components/shared/DataTable";
import type { ActionConfig } from "@/types/Table/action";

import { 
  useListSubscriptionPlansQuery, 
  useCreateSubscriptionPlanMutation, 
  useUpdateSubscriptionPlanMutation, 
  useDeleteSubscriptionPlanMutation,
  SubscriptionPlan
} from "@/features/admin/subscription-plans/api/adminSubscriptionPlansApi";
import SubscriptionPlanFormDialog, { SubscriptionPlanFormValues } from "./components/SubscriptionPlanFormDialog";

export default function AdminSubscriptionPlansPage() {
  const { data: plansResponse, isLoading, isFetching } = useListSubscriptionPlansQuery();
  const [createPlan, { isLoading: isCreating }] = useCreateSubscriptionPlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdateSubscriptionPlanMutation();
  const [deletePlan, { isLoading: isDeleting }] = useDeleteSubscriptionPlanMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const plans = useMemo(() => plansResponse?.data ?? [], [plansResponse]);

  const stats = useMemo(() => {
    const total = plans.length;
    const active = plans.filter(p => p.status === 'ACTIVE').length;
    return [
      {
        title: "Total Plans",
        value: total,
        accentColor: "cyan" as const,
      },
      {
        title: "Active Plans",
        value: active,
        accentColor: "green" as const,
      },
      {
        title: "Inactive Plans",
        value: total - active,
        accentColor: "yellow" as const,
      }
    ];
  }, [plans]);

  const columns = useMemo<ColumnConfig[]>(() => [
    {
      key: "planName",
      title: "Plan Name",
      render: (value) => (
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#0B59A2]" />
          <span className="font-semibold text-slate-900">{String(value)}</span>
        </div>
      )
    },
    {
      key: "price",
      title: "Price",
      render: (_value, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">
            {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: (row as SubscriptionPlan).currency }).format(Number((row as SubscriptionPlan).price))}
          </span>
          <span className="text-[10px] text-slate-500 uppercase">per {(row as SubscriptionPlan).durationDays} days</span>
        </div>
      )
    },
    {
      key: "status",
      title: "Status",
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
          value === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
        }`}>
          {String(value)}
        </span>
      )
    },
    {
      key: "createdAt",
      title: "Created At",
      render: (value) => (
        <div className="flex items-center gap-1.5 text-slate-500">
          <Calendar className="h-3.5 w-3.5" />
          <span className="text-xs">{new Date(String(value)).toLocaleDateString()}</span>
        </div>
      )
    }
  ], []);

  const handleOpenCreate = () => {
    setFormMode("create");
    setEditingPlan(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setFormMode("edit");
    setEditingPlan(plan);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: SubscriptionPlanFormValues) => {
    try {
      if (formMode === "create") {
        await createPlan(values).unwrap();
        toast.success("Plan created successfully");
      } else if (editingPlan) {
        await updatePlan({ id: editingPlan.id, body: values }).unwrap();
        toast.success("Plan updated successfully");
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err?.data?.message || "Failed to save plan");
      toast.error("Failed to save plan");
    }
  };

  const handleDelete = async (plan: SubscriptionPlan) => {
    if (!window.confirm(`Are you sure you want to delete "${plan.planName}"?`)) return;
    try {
      await deletePlan({ id: plan.id }).unwrap();
      toast.success("Plan deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete plan");
    }
  };

  const actions = useMemo<ActionConfig<SubscriptionPlan>[]>(() => [
    {
      title: "Edit",
      icon: Pencil,
      onClick: (row) => handleOpenEdit(row as SubscriptionPlan),
    },
    {
      title: "Delete",
      icon: Trash2,
      tone: "danger",
      onClick: (row) => handleDelete(row as SubscriptionPlan),
    }
  ], []);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  return (
    <>
      <ListingPage
        title="Subscription Plans"
        breadCrumbTitle="Plans"
        description="Manage premium monetization plans for users."
        stats={stats}
        headerSlot={
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Plan
          </Button>
        }
        tableProps={{
          data: plans || [],
          columns,
          loading: isLoading || isFetching,
          actions,
          sortStatus,
          onSort: setSortStatus,
          noRecordText: "No subscription plans found.",
          searchable: true,
          searchPlaceholder: "Search by plan name..."
        }}
      />

      <SubscriptionPlanFormDialog
        mode={formMode}
        isOpen={isFormOpen}
        loading={isCreating || isUpdating}
        error={formError}
        initialValues={editingPlan ? {
          planName: editingPlan.planName,
          price: Number(editingPlan.price),
          durationDays: editingPlan.durationDays,
          description: editingPlan.description || "",
          status: editingPlan.status,
          perks: editingPlan.perks
        } : undefined}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}
