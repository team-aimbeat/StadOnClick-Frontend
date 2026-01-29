import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { HiOutlineArrowPath, HiOutlineSparkles } from "react-icons/hi2";
import { Shield, Gauge, Eye } from "lucide-react";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import StatsCard from "@/components/shared/StatsCard";
import { DataTable, type ColumnConfig } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SponsorshipPlanFormDialog, {
  SponsorshipPlanFormValues,
} from "./components/SponsorshipPlanFormDialog";
import {
  useCreateAdminSponsorshipPlanMutation,
  useListAdminSponsorshipPlansQuery,
  useUpdateAdminSponsorshipPlanMutation,
} from "@/features/adminSponsorships/api/adminSponsorships.api";

const AdminSponsorshipPlansPage = () => {
  const {
    data: plans = [],
    isLoading,
    isFetching,
    error: listError,
    refetch,
  } = useListAdminSponsorshipPlansQuery();
  const [createPlan, { isLoading: isCreating }] = useCreateAdminSponsorshipPlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdateAdminSponsorshipPlanMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const columns = useMemo<ColumnConfig[]>(
    () => [
      {
        key: "name",
        title: "Name",
        render: (_value, row) => (
          <div>
            <div className="font-semibold text-slate-900">{row.name}</div>
            <div className="text-xs text-slate-500">
              Impression cap: {row.impressionCap ?? "Unlimited"}
            </div>
          </div>
        ),
      },
      {
        key: "price",
        title: "Price",
        render: (_value, row) => (
          <div className="font-semibold text-slate-900">
            {(row.currency || "SEK").toUpperCase()} {Number(row.price ?? 0).toLocaleString()}
          </div>
        ),
      },
      {
        key: "priorityScore",
        title: "Priority",
        render: (value) => (
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            {value}
          </span>
        ),
      },
      {
        key: "durationDays",
        title: "Duration",
        render: (value) => <span className="text-slate-700">{value} days</span>,
      },
      {
        key: "status",
        title: "Status",
        render: (_value, row) => (
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
              row.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-current opacity-70" />
            {row.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
    ],
    []
  );

  const stats = useMemo(
    () => [
      {
        title: "Total Plans",
        value: plans.length,
        subtitle: `${plans.filter((p) => !p.isActive).length} inactive`,
        accentColor: "cyan" as const,
        icon: Shield,
      },
      {
        title: "Active Plans",
        value: plans.filter((p) => p.isActive).length,
        subtitle: "Visible to vendors",
        accentColor: "green" as const,
        icon: HiOutlineSparkles,
      },
      {
        title: "Highest Priority",
        value: plans.reduce((acc, p) => Math.max(acc, Number(p.priorityScore ?? 0)), 0),
        subtitle: "Boost weight",
        accentColor: "purple" as const,
        icon: Gauge,
      },
      {
        title: "With Caps",
        value: plans.filter((p) => typeof p.impressionCap === "number").length,
        subtitle: "Impression capped plans",
        accentColor: "yellow" as const,
        icon: Eye,
      },
    ],
    [plans]
  );

  const parseError = (error: unknown) => {
    if (!error) return "Request failed";
    if (typeof error === "string") return error;
    if (typeof (error as any).data === "string") return (error as any).data;
    if ((error as any).data?.message) return (error as any).data.message;
    if (error instanceof Error) return error.message;
    return "Request failed";
  };

  const handleSave = async (values: SponsorshipPlanFormValues) => {
    setFormError(null);
    try {
      if (editingId) {
        await updatePlan({ id: editingId, body: values }).unwrap();
        toast.success("Plan updated");
      } else {
        await createPlan(values).unwrap();
        toast.success("Plan created");
      }
      setEditingId(null);
      setIsDialogOpen(false);
      refetch();
    } catch (err) {
      const message = parseError(err);
      setFormError(message);
      toast.error(message);
    }
  };

  const loading = isLoading || isFetching;

  return (
    <DashboardContainer className="space-y-6 pb-12">
      <div className="flex flex-col gap-2">
        <TitleBreadCrumbs
          title="Sponsorship Plans"
          breadCrumbTitle="Finance / Sponsorship Plans"
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setEditingId(null);
              setIsDialogOpen(true);
            }}
          >
            New Plan
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6">
        <DataTable
          title="Sponsorship Plans"
          breadCrumbTitle="Create, update, and manage sponsorship boost plans"
          data={plans}
          columns={columns}
          loading={loading}
          error={listError ? parseError(listError) : null}
          onDismissError={() => null}
          selectable={false}
          searchable={false}
          showSerialNumber={false}
          noRecordText="No plans created yet. Use the New Plan button to add one."
          customRowRenderer={(row, rowIndex) => {
            const isActiveRow = editingId === row.id;
            return (
              <tr
                key={row.id ?? rowIndex}
                className={`cursor-pointer transition hover:bg-blue-50/40 ${
                  isActiveRow ? "bg-blue-50" : ""
                }`}
                onClick={() => {
                  setEditingId(row.id as string);
                  setIsDialogOpen(true);
                }}
              >
                {columns.map((col, idx) => (
                  <td key={col.key} className={`px-4 py-3 ${idx === 0 ? "pl-6" : ""}`}>
                    {col.render ? col.render((row as any)[col.key], row, idx) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            );
          }}
        />

      </div>

      <SponsorshipPlanFormDialog
        mode={editingId ? "edit" : "create"}
        isOpen={isDialogOpen}
        loading={isCreating || isUpdating}
        error={formError ?? undefined}
        initialValues={
          editingId
            ? (() => {
                const current = plans.find((p) => p.id === editingId);
                if (!current) return undefined;
                return {
                  name: current.name,
                  price: Number(current.price ?? 0),
                  currency: current.currency ?? "SEK",
                  durationDays: Number(current.durationDays ?? 0),
                  priorityScore: Number(current.priorityScore ?? 0),
                  impressionCap:
                    typeof current.impressionCap === "number" ? current.impressionCap : null,
                  isActive: Boolean(current.isActive),
                };
              })()
            : undefined
        }
        onClose={() => {
          setIsDialogOpen(false);
          setEditingId(null);
          setFormError(null);
        }}
        onSubmit={handleSave}
      />
    </DashboardContainer>
  );
};

export default AdminSponsorshipPlansPage;
