import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  BadgeCheck,
  CheckSquare,
  CircleSlash,
  Layers3,
  Package2,
  Power,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
} from "lucide-react";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import {
  useBulkToggleAdminOfferingStatusMutation,
  useListAdminOfferingsQuery,
  useToggleAdminOfferingStatusMutation,
} from "@/features/admin/offerings/api/adminOfferingsApi";

const money = new Intl.NumberFormat("en-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

export default function AdminOfferingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const serviceId = searchParams.get("serviceId") ?? "";
  const serviceTitle = searchParams.get("serviceTitle") ?? "";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<"all" | "active" | "inactive">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading, isFetching } = useListAdminOfferingsQuery({
    page,
    limit: 18,
    search: search || undefined,
    serviceId: serviceId || undefined,
    active,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [toggleStatus, { isLoading: isToggling }] = useToggleAdminOfferingStatusMutation();
  const [bulkToggle, { isLoading: isBulkToggling }] = useBulkToggleAdminOfferingStatusMutation();

  const offerings = data?.data ?? [];
  const meta = data?.meta;

  const summary = useMemo(() => {
    const activeCount = offerings.filter((item) => item.isActive).length;
    const inactiveCount = offerings.length - activeCount;
    const bookingCount = offerings.reduce((sum, item) => sum + Number(item.bookingCount ?? 0), 0);
    const unitsCount = offerings.reduce((sum, item) => sum + Number(item.bookedUnits ?? 0), 0);
    const revenueEstimate = offerings.reduce(
      (sum, item) => sum + Number(item.salePrice ?? 0) * Number(item.bookingCount ?? 0),
      0,
    );

    return {
      visible: offerings.length,
      active: activeCount,
      inactive: inactiveCount,
      bookings: bookingCount,
      units: unitsCount,
      revenueEstimate,
    };
  }, [offerings]);

  const allSelectedOnPage = useMemo(
    () => offerings.length > 0 && offerings.every((row) => selectedIds.includes(row.id)),
    [offerings, selectedIds],
  );

  const toggleOne = async (id: string, nextActive: boolean) => {
    try {
      await toggleStatus({ id, active: nextActive }).unwrap();
      toast.success(`Offering ${nextActive ? "enabled" : "disabled"}`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update offering");
    }
  };

  const toggleBulk = async (nextActive: boolean) => {
    if (!selectedIds.length) {
      toast.error("Select at least one offering");
      return;
    }
    try {
      await bulkToggle({ ids: selectedIds, active: nextActive }).unwrap();
      setSelectedIds([]);
      toast.success(`Selected offerings ${nextActive ? "enabled" : "disabled"}`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Bulk update failed");
    }
  };

  return (
    <DashboardContainer className="space-y-6">
      <TitleBreadCrumbs title="Offerings Management" breadCrumbTitle="Admin / Offerings" />

      {serviceId ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-blue-800">
              Focused View: Offerings for service{" "}
              <span className="font-bold">{serviceTitle || serviceId}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete("serviceId");
                next.delete("serviceTitle");
                setSearchParams(next, { replace: true });
                setPage(1);
              }}
              className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
            >
              Show all offerings
            </button>
          </div>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="relative border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-indigo-50 p-4 md:p-6">
          <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-blue-100/60 blur-2xl" />
          <div className="absolute -bottom-16 left-8 h-28 w-28 rounded-full bg-violet-100/70 blur-2xl" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Offerings Control Center</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Manage Catalog Performance</h2>
            <p className="mt-1 text-sm text-slate-600">
              Enable, disable, and optimize offerings from a visual card workspace.
            </p>
          </div>
        </div>

        <div className="grid gap-3 p-4 md:grid-cols-3 md:p-6 xl:grid-cols-6">
          {[
            { label: "Visible", value: summary.visible, icon: Layers3, tone: "text-slate-700 bg-slate-100" },
            { label: "Active", value: summary.active, icon: BadgeCheck, tone: "text-emerald-700 bg-emerald-100" },
            { label: "Inactive", value: summary.inactive, icon: Sparkles, tone: "text-rose-700 bg-rose-100" },
            { label: "Bookings", value: summary.bookings, icon: ShoppingBag, tone: "text-violet-700 bg-violet-100" },
            { label: "Booked Units", value: summary.units, icon: Users, tone: "text-blue-700 bg-blue-100" },
            {
              label: "Revenue Est.",
              value: money.format(summary.revenueEstimate),
              icon: ArrowUpRight,
              tone: "text-cyan-700 bg-cyan-100",
            },
          ].map((metric) => (
            <article key={metric.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{metric.label}</p>
                <span className={`rounded-lg p-1.5 ${metric.tone}`}>
                  <metric.icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 truncate text-2xl font-bold text-slate-900">{metric.value}</p>
            </article>
          ))}
        </div>

        <div className="border-t border-slate-100 p-4 md:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search offering, service, or vendor..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            {(["all", "active", "inactive"] as const).map((item) => {
              const isActiveFilter = active === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setActive(item);
                  }}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    isActiveFilter
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {item === "all" ? "All" : item === "active" ? "Active" : "Inactive"}
                </button>
              );
            })}
            <span className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
              <CheckSquare className="h-3.5 w-3.5" />
              Selected {selectedIds.length}
            </span>
            <button
              type="button"
              onClick={() => toggleBulk(true)}
              disabled={isBulkToggling}
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              <Power className="h-3.5 w-3.5" />
              Bulk Enable
            </button>
            <button
              type="button"
              onClick={() => toggleBulk(false)}
              disabled={isBulkToggling}
              className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              <CircleSlash className="h-3.5 w-3.5" />
              Bulk Disable
            </button>
          </div>
        </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
          ))
        ) : offerings.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm font-medium text-slate-700">No offerings found for this filter.</p>
            <p className="mt-1 text-xs text-slate-500">Try changing active status or search keywords.</p>
          </div>
        ) : (
          offerings.map((row) => {
            const isSelected = selectedIds.includes(row.id);
            const statusTone = row.isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700";
            const bookings = Number(row.bookingCount ?? 0);
            const bookedUnits = Number(row.bookedUnits ?? 0);
            const engagement = Math.min(100, Math.round((bookings + bookedUnits) * 4));

            return (
              <article
                key={row.id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  isSelected ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200"
                }`}
              >
                <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone}`}>
                    {row.isActive ? "Active" : "Inactive"}
                  </span>
                  <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) =>
                        setSelectedIds((prev) =>
                          e.target.checked ? [...prev, row.id] : prev.filter((id) => id !== row.id),
                        )
                      }
                    />
                    Select
                  </label>
                </div>

                <div className="mt-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-slate-900">{row.name}</h3>
                    <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-slate-600">
                      {row.description || "No description available."}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isToggling}
                    onClick={() => toggleOne(row.id, !row.isActive)}
                    className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {row.isActive ? "Disable" : "Enable"}
                  </button>
                </div>

                <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Store className="h-4 w-4" />
                    <span className="truncate">{row.service?.vendor?.businessName ?? "-"}</span>
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                    {row.service?.title ?? "-"}
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Price</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {money.format(Number(row.salePrice ?? 0))}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Bookings</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{bookings}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Units</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{bookedUnits}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Package2 className="h-3.5 w-3.5" />
                      Engagement
                    </span>
                    <span>{engagement}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${engagement}%` }} />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                    Offering
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={allSelectedOnPage}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedIds((prev) => Array.from(new Set([...prev, ...offerings.map((r) => r.id)])));
              } else {
                setSelectedIds((prev) => prev.filter((id) => !offerings.some((r) => r.id === id)));
              }
            }}
          />
          <span>Select all on page</span>
        </label>

        <p>
          Page {meta?.page ?? page} of {meta?.totalPages ?? 1}
          {isFetching ? " (refreshing...)" : ""}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={(meta?.page ?? page) <= 1}
            className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={meta ? meta.page >= meta.totalPages : false}
            className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </DashboardContainer>
  );
}
