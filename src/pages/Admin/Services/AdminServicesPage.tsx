import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  ExternalLink,
  Layers3,
  PauseCircle,
  PlayCircle,
  Search,
  Users,
  Wallet,
} from "lucide-react";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import {
  useDeleteAdminServiceMutation,
  useListAdminServicesQuery,
  useUpdateAdminServiceMutation,
} from "@/features/admin/services/api/adminServicesApi";

export default function AdminServicesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "DRAFT" | "LIVE" | "PAUSED">("all");

  const { data, isLoading, isFetching } = useListAdminServicesQuery({
    page,
    limit: 20,
    search: search || undefined,
    status,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [updateService, { isLoading: isUpdating }] = useUpdateAdminServiceMutation();
  const [deleteService, { isLoading: isDeleting }] = useDeleteAdminServiceMutation();

  const rows = data?.data ?? [];
  const meta = data?.meta;

  const summary = useMemo(() => {
    const live = rows.filter((row) => row.status === "LIVE").length;
    const paused = rows.filter((row) => row.status === "PAUSED").length;
    const draft = rows.filter((row) => row.status === "DRAFT").length;
    const offerings = rows.reduce(
      (acc, row) => acc + Number(row?._count?.offerings ?? 0),
      0,
    );
    const bookings = rows.reduce(
      (acc, row) => acc + Number(row?._count?.bookings ?? 0),
      0,
    );

    return {
      total: rows.length,
      live,
      paused,
      draft,
      offerings,
      bookings,
    };
  }, [rows]);

  const handleStatusChange = async (id: string, nextStatus: "DRAFT" | "LIVE" | "PAUSED") => {
    try {
      await updateService({ id, status: nextStatus }).unwrap();
      toast.success("Service updated");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update service");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteService(id).unwrap();
      toast.success("Service deleted");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete service");
    }
  };

  return (
    <DashboardContainer className="space-y-6">
      <TitleBreadCrumbs title="Services Management" breadCrumbTitle="Admin / Services" />

      <section className="rounded-3xl border border-slate-200 bg-white p-4 md:p-6">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {[
            { label: "Visible", value: summary.total, icon: Layers3, tone: "text-slate-700 bg-slate-100" },
            { label: "Live", value: summary.live, icon: PlayCircle, tone: "text-emerald-700 bg-emerald-100" },
            { label: "Paused", value: summary.paused, icon: PauseCircle, tone: "text-amber-700 bg-amber-100" },
            { label: "Draft", value: summary.draft, icon: BarChart3, tone: "text-violet-700 bg-violet-100" },
            { label: "Offerings", value: summary.offerings, icon: Wallet, tone: "text-blue-700 bg-blue-100" },
            { label: "Bookings", value: summary.bookings, icon: Users, tone: "text-rose-700 bg-rose-100" },
          ].map((metric) => (
            <article key={metric.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {metric.label}
                </p>
                <span className={`rounded-lg p-1.5 ${metric.tone}`}>
                  <metric.icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{metric.value}</p>
            </article>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search service, vendor, or category..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "LIVE", "PAUSED", "DRAFT"] as const).map((item) => {
              const activeFilter = status === item;
              const label = item === "all" ? "All" : item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setStatus(item);
                  }}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeFilter
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
          ))
        ) : rows.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm font-medium text-slate-700">No services found for this filter.</p>
            <p className="mt-1 text-xs text-slate-500">Try changing status or search keywords.</p>
          </div>
        ) : (
          rows.map((row) => {
            const statusTone =
              row.status === "LIVE"
                ? "bg-emerald-100 text-emerald-700"
                : row.status === "PAUSED"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-violet-100 text-violet-700";

            return (
              <article
                key={row.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-[11px] font-semibold text-slate-700">
                        {row.vendor?.profileImageUrl ? (
                          <img
                            src={row.vendor.profileImageUrl}
                            alt={row.vendor?.businessName ?? "Vendor"}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          (row.vendor?.businessName ?? "V").slice(0, 1).toUpperCase()
                        )}
                      </div>
                    <h3 className="truncate text-base mt-5 font-bold text-slate-900">{row.title}</h3>
                    <div className="mt-1 flex items-center gap-2">
              
                      <p className="truncate text-xs text-slate-500">
                        {row.vendor?.businessName ?? "-"} • {row.category?.name ?? "-"}
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone}`}>
                    {row.status}
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 min-h-[2.75rem] text-sm text-slate-600">
                  {row.description || "No description available."}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Offerings</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{row._count?.offerings ?? 0}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Bookings</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{row._count?.bookings ?? 0}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <select
                    value={row.status}
                    onChange={(e) =>
                      handleStatusChange(row.id, e.target.value as "DRAFT" | "LIVE" | "PAUSED")
                    }
                    disabled={isUpdating}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="LIVE">LIVE</option>
                    <option value="PAUSED">PAUSED</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/offerings?serviceId=${row.id}&serviceTitle=${encodeURIComponent(row.title)}`)}
                    className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    Details
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(row.id)}
                    disabled={isDeleting}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>

      <div className="flex items-center justify-between text-sm text-slate-600">
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
