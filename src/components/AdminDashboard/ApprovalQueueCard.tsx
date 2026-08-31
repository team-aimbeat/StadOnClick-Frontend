import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import {
  useListAdminCategoryServiceRequestsQuery,
  useListAdminMasterServiceRequestsQuery,
  type AdminCategoryServiceRequest,
  type AdminMasterServiceRequest,
} from "@/features/admin/service-categories/api/adminServiceCategoriesApi";

const QueueEmptyState = ({ label }: { label: string }) => (
  <div className="flex min-h-[128px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-5 text-center">
    <div>
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <HiOutlineClipboardDocumentList className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-900">0 pending</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  </div>
);

const MasterRequestRow = ({ request }: { request: AdminMasterServiceRequest }) => (
  <div className="flex items-start justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <p className="truncate text-sm font-semibold text-slate-900">{request.name}</p>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
          {request.status}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {request.slug} • {request.vendor.businessName} • {request.requestedByUser.email}
      </p>
      {request.adminNotes ? <p className="mt-1 text-xs text-slate-600">{request.adminNotes}</p> : null}
    </div>
  </div>
);

const CategoryRequestRow = ({ request }: { request: AdminCategoryServiceRequest }) => (
  <div className="flex items-start justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <p className="truncate text-sm font-semibold text-slate-900">{request.name}</p>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
          {request.status}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {request.slug} • {request.masterCategory.name} • {request.vendor.businessName} • {request.requestedByUser.email}
      </p>
      {request.adminNotes ? <p className="mt-1 text-xs text-slate-600">{request.adminNotes}</p> : null}
    </div>
  </div>
);

const ApprovalQueueCard = () => {
  const { data: masterRequests = [], isLoading: masterLoading } = useListAdminMasterServiceRequestsQuery();
  const { data: categoryRequests = [], isLoading: categoryLoading } = useListAdminCategoryServiceRequestsQuery();

  const pendingMasters = masterRequests.filter((request) => request.status === "PENDING");
  const pendingCategories = categoryRequests.filter((request) => request.status === "PENDING");

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Approval Queue
            </p>
            <h3 className="text-lg font-semibold text-slate-900">Vendor master service requests</h3>
            <p className="mt-2 text-sm text-slate-500">Track vendor master requests before they go live.</p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            {pendingMasters.length} pending
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {masterLoading ? (
            <p className="text-sm text-slate-500">Loading approval requests...</p>
          ) : pendingMasters.length === 0 ? (
            <QueueEmptyState label="No vendor requests submitted yet." />
          ) : (
            pendingMasters.slice(0, 2).map((request) => <MasterRequestRow key={request.id} request={request} />)
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Category Queue
            </p>
            <h3 className="text-lg font-semibold text-slate-900">Vendor service category requests</h3>
            <p className="mt-2 text-sm text-slate-500">Review and approve category changes from vendors.</p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            {pendingCategories.length} pending
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {categoryLoading ? (
            <p className="text-sm text-slate-500">Loading category requests...</p>
          ) : pendingCategories.length === 0 ? (
            <QueueEmptyState label="No vendor category requests submitted yet." />
          ) : (
            pendingCategories.slice(0, 2).map((request) => <CategoryRequestRow key={request.id} request={request} />)
          )}
        </div>
      </section>
    </div>
  );
};

export default ApprovalQueueCard;
