import { useMemo, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import {
  HiOutlineBolt,
  HiOutlineClipboardDocumentCheck,
  HiOutlineCloudArrowUp,
  HiOutlineSquaresPlus,
  HiOutlineSwatch,
} from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import {
  useCreateAdminServiceCategoryMutation,
  useCreateAdminServiceMasterMutation,
  useDeleteAdminServiceCategoryMutation,
  useDeleteAdminServiceMasterMutation,
  useListAdminCategoryServiceRequestsQuery,
  useListAdminMasterServiceRequestsQuery,
  useListAdminServiceMastersQuery,
  useReviewAdminCategoryServiceRequestMutation,
  useReviewAdminMasterServiceRequestMutation,
  useUpdateAdminServiceCategoryMutation,
  useUpdateAdminServiceMasterMutation,
  type AdminCategoryServiceRequest,
  type AdminMasterServiceRequest,
  type AdminServiceMasterCategory,
  type AdminServiceSubCategory,
} from "@/features/admin/service-categories/api/adminServiceCategoriesApi";

type MasterDraft = { id?: string; name: string; slug: string; icon: string; sortOrder: string; isActive: boolean };
type CategoryDraft = { id?: string; masterCategoryId: string; name: string; slug: string; icon: string; sortOrder: string; isActive: boolean };

const emptyMasterDraft: MasterDraft = { name: "", slug: "", icon: "", sortOrder: "0", isActive: true };
const emptyCategoryDraft: CategoryDraft = { masterCategoryId: "", name: "", slug: "", icon: "", sortOrder: "0", isActive: true };

const SectionTitle = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div>
    <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
    <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
  </div>
);

const StatusPill = ({ children }: { children: ReactNode }) => (
  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{children}</span>
);

const IconBadge = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef3ff] text-[#3554e0]">
    {children}
  </div>
);

const QueueCard = ({
  title,
  description,
  pendingCount,
  children,
}: {
  title: string;
  description: string;
  pendingCount: number;
  children: ReactNode;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 ">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <IconBadge><HiOutlineClipboardDocumentCheck className="h-5 w-5" /></IconBadge>
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <StatusPill>{pendingCount} pending</StatusPill>
    </div>
    <div className="mt-5">{children}</div>
  </div>
);

const ActionButton = ({
  label,
  tone,
  onClick,
  disabled,
}: {
  label: string;
  tone: "danger" | "primary";
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={
      tone === "danger"
        ? "rounded-full bg-[#ca2b2b] px-4 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-60"
        : "rounded-full bg-[#3554e0] px-4 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-60"
    }
  >
    {label}
  </button>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">{text}</div>
);

export default function ServiceCatalogStudio() {
  const { data: masters = [], isLoading: isMastersLoading } = useListAdminServiceMastersQuery();
  const { data: masterRequests = [], isLoading: isRequestsLoading } = useListAdminMasterServiceRequestsQuery();
  const { data: categoryRequests = [], isLoading: isCategoryRequestsLoading } = useListAdminCategoryServiceRequestsQuery();

  const [selectedMasterId, setSelectedMasterId] = useState("");
  const [serviceName, setServiceName] = useState("Marketplace Standard");
  const [baseCommission, setBaseCommission] = useState("12.5");
  const [autoApprove, setAutoApprove] = useState(true);
  const [masterDraft, setMasterDraft] = useState<MasterDraft>(emptyMasterDraft);
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft>(emptyCategoryDraft);

  const [createMaster, { isLoading: creatingMaster }] = useCreateAdminServiceMasterMutation();
  const [updateMaster, { isLoading: updatingMaster }] = useUpdateAdminServiceMasterMutation();
  const [deleteMaster, { isLoading: deletingMaster }] = useDeleteAdminServiceMasterMutation();
  const [createCategory, { isLoading: creatingCategory }] = useCreateAdminServiceCategoryMutation();
  const [updateCategory, { isLoading: updatingCategory }] = useUpdateAdminServiceCategoryMutation();
  const [deleteCategory, { isLoading: deletingCategory }] = useDeleteAdminServiceCategoryMutation();
  const [reviewRequest, { isLoading: reviewingRequest }] = useReviewAdminMasterServiceRequestMutation();
  const [reviewCategoryRequest, { isLoading: reviewingCategoryRequest }] = useReviewAdminCategoryServiceRequestMutation();

  const selectedMaster = useMemo(() => masters.find((master) => master.id === selectedMasterId), [masters, selectedMasterId]);
  const visibleCategories = selectedMaster?.categories ?? [];
  const pendingRequests = masterRequests.filter((request) => request.status === "PENDING");
  const pendingCategoryRequests = categoryRequests.filter((request) => request.status === "PENDING");

  const saveMaster = async () => {
    if (!masterDraft.name.trim()) return toast.error("Master service name is required.");
    const payload = {
      name: masterDraft.name.trim(),
      slug: masterDraft.slug.trim() || undefined,
      icon: masterDraft.icon.trim() || undefined,
      sortOrder: Number(masterDraft.sortOrder || 0),
      isActive: masterDraft.isActive,
    };
    try {
      if (masterDraft.id) await updateMaster({ id: masterDraft.id, body: payload }).unwrap();
      else await createMaster(payload).unwrap();
      toast.success(masterDraft.id ? "Master service updated." : "Master service created.");
      setMasterDraft(emptyMasterDraft);
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to save master service.");
    }
  };

  const saveCategory = async () => {
    if (!categoryDraft.masterCategoryId) return toast.error("Select a master service first.");
    if (!categoryDraft.name.trim()) return toast.error("Subcategory name is required.");
    const payload = {
      masterCategoryId: categoryDraft.masterCategoryId,
      name: categoryDraft.name.trim(),
      slug: categoryDraft.slug.trim() || undefined,
      icon: categoryDraft.icon.trim() || undefined,
      sortOrder: Number(categoryDraft.sortOrder || 0),
      isActive: categoryDraft.isActive,
    };
    try {
      if (categoryDraft.id) await updateCategory({ id: categoryDraft.id, body: payload }).unwrap();
      else await createCategory(payload).unwrap();
      toast.success(categoryDraft.id ? "Subcategory updated." : "Subcategory created.");
      setCategoryDraft((prev) => ({ ...emptyCategoryDraft, masterCategoryId: prev.masterCategoryId || selectedMasterId || "" }));
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to save subcategory.");
    }
  };

  const reviewMaster = async (request: AdminMasterServiceRequest, status: "APPROVED" | "REJECTED") => {
    try {
      await reviewRequest({
        id: request.id,
        body: { status, icon: request.icon ?? undefined, sortOrder: request.sortOrder ?? 0, isActive: true },
      }).unwrap();
      toast.success(status === "APPROVED" ? "Master service request approved." : "Master service request rejected.");
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to review request.");
    }
  };

  const reviewCategory = async (request: AdminCategoryServiceRequest, status: "APPROVED" | "REJECTED") => {
    try {
      await reviewCategoryRequest({
        id: request.id,
        body: { status, icon: request.icon ?? undefined, sortOrder: request.sortOrder ?? 0, isActive: true },
      }).unwrap();
      toast.success(status === "APPROVED" ? "Category request approved." : "Category request rejected.");
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to review category request.");
    }
  };

  const handleMasterEdit = (master: AdminServiceMasterCategory) => {
    setMasterDraft({
      id: master.id,
      name: master.name,
      slug: master.slug,
      icon: master.icon ?? "",
      sortOrder: String(master.sortOrder ?? 0),
      isActive: master.isActive,
    });
  };

  const handleCategoryEdit = (category: AdminServiceSubCategory) => {
    setCategoryDraft({
      id: category.id,
      masterCategoryId: category.masterCategoryId,
      name: category.name,
      slug: category.slug,
      icon: category.icon ?? "",
      sortOrder: String(category.sortOrder ?? 0),
      isActive: category.isActive,
    });
  };

  const handleMasterDelete = async (id: string) => {
    if (!window.confirm("Delete this master service and all linked subcategories?")) return;
    try {
      await deleteMaster(id).unwrap();
      if (selectedMasterId === id) setSelectedMasterId("");
      if (masterDraft.id === id) setMasterDraft(emptyMasterDraft);
      toast.success("Master service deleted.");
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to delete master service.");
    }
  };

  const handleCategoryDelete = async (id: string) => {
    if (!window.confirm("Delete this subcategory?")) return;
    try {
      await deleteCategory(id).unwrap();
      if (categoryDraft.id === id) setCategoryDraft((prev) => ({ ...emptyCategoryDraft, masterCategoryId: prev.masterCategoryId || selectedMasterId || "" }));
      toast.success("Subcategory deleted.");
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to delete subcategory.");
    }
  };

  return (
    <DashboardContainer className="space-y-8">
      <TitleBreadCrumbs title="Service Master Studio" breadCrumbTitle="Admin / Catalog / Service Masters" />

      <section className="space-y-5">
        <SectionTitle title="Service Request Queue" subtitle="Manage and moderate vendor onboarding and category expansion requests." />
        <div className="grid gap-4 lg:grid-cols-2">
          <QueueCard title="Approval Queue" description="Vendor master service requests awaiting verification." pendingCount={pendingRequests.length}>
            {isRequestsLoading ? (
              <p className="text-sm text-slate-500">Loading approval requests...</p>
            ) : pendingRequests.length === 0 ? (
              <EmptyState text="No vendor requests submitted yet." />
            ) : (
              pendingRequests.slice(0, 1).map((request) => (
                <div key={request.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">{request.name.slice(0, 1).toUpperCase()}</div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{request.name}</p>
                        <p className="truncate text-xs text-slate-500">{request.vendor.businessName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ActionButton label="Reject" tone="danger" onClick={() => reviewMaster(request, "REJECTED")} disabled={reviewingRequest} />
                      <ActionButton label="Approve" tone="primary" onClick={() => reviewMaster(request, "APPROVED")} disabled={reviewingRequest} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </QueueCard>

          <QueueCard title="Category Queue" description="Vendor service category requests for catalog expansion." pendingCount={pendingCategoryRequests.length}>
            {isCategoryRequestsLoading ? (
              <p className="text-sm text-slate-500">Loading category requests...</p>
            ) : pendingCategoryRequests.length === 0 ? (
              <EmptyState text="No vendor category requests submitted yet." />
            ) : (
              pendingCategoryRequests.slice(0, 1).map((request) => (
                <div key={request.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">{request.name.slice(0, 1).toUpperCase()}</div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{request.name}</p>
                        <p className="truncate text-xs text-slate-500">{request.masterCategory.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ActionButton label="Reject" tone="danger" onClick={() => reviewCategory(request, "REJECTED")} disabled={reviewingCategoryRequest} />
                      <ActionButton label="Approve" tone="primary" onClick={() => reviewCategory(request, "APPROVED")} disabled={reviewingCategoryRequest} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </QueueCard>
        </div>
      </section>

      <section className="space-y-5">
        <SectionTitle title="Service Configuration" subtitle="Configure the default service profile, commission, and media overlay." />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Service Name</label>
                <input value={serviceName} onChange={(e) => setServiceName(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Base Commission (%)</label>
                <input type="number" value={baseCommission} onChange={(e) => setBaseCommission(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium outline-none" />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Auto-Approve Certified Vendors</p>
                  <p className="text-xs text-slate-500">Skip manual queue for pre-verified partners</p>
                </div>
                <button type="button" onClick={() => setAutoApprove((prev) => !prev)} className={`flex h-8 w-14 items-center rounded-full p-1 ${autoApprove ? "bg-[#3554e0]" : "bg-slate-300"}`}>
                  <span className={`h-6 w-6 rounded-full bg-white shadow-sm transition ${autoApprove ? "translate-x-6" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Service Icon Overlay</p>
            <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-100/80 text-center">
              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#3554e0] shadow-sm">
                  <HiOutlineCloudArrowUp className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-700">Drag and drop or click to upload</p>
                <p className="mt-1 text-xs text-slate-500">PNG, JPG up to 5MB (Recommend 512x512)</p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button type="button" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700">Reset Changes</button>
              <button type="button" className="rounded-full bg-[#3554e0] px-6 py-2.5 text-sm font-semibold text-white">Save Configuration</button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <SectionTitle title="Master Service Management" subtitle="Configure global service hierarchies and subcategory mappings." />
          <button type="button" className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Export Schema</button>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-5 flex items-center gap-3">
              <IconBadge><HiOutlineSquaresPlus className="h-5 w-5" /></IconBadge>
              <h3 className="text-base font-semibold text-slate-900">Create master service</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Service Name<input value={masterDraft.name} onChange={(e) => setMasterDraft((prev) => ({ ...prev, name: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none" placeholder="e.g. Home Cleaning" /></label>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Slug<input value={masterDraft.slug} onChange={(e) => setMasterDraft((prev) => ({ ...prev, slug: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none" placeholder="home-cleaning" /></label>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Sort Order<input type="number" value={masterDraft.sortOrder} onChange={(e) => setMasterDraft((prev) => ({ ...prev, sortOrder: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none" /></label>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Icon Key<input value={masterDraft.icon} onChange={(e) => setMasterDraft((prev) => ({ ...prev, icon: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none" placeholder="material-icon-name" /></label>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full bg-[#3554e0]" /><span className="text-sm font-medium text-slate-700">Active Status</span></div>
              <button type="button" onClick={() => setMasterDraft((prev) => ({ ...prev, isActive: !prev.isActive }))} className={`flex h-8 w-14 items-center rounded-full p-1 ${masterDraft.isActive ? "bg-[#3554e0]" : "bg-slate-300"}`}><span className={`h-6 w-6 rounded-full bg-white shadow-sm transition ${masterDraft.isActive ? "translate-x-6" : "translate-x-0"}`} /></button>
            </div>
            <button type="button" onClick={saveMaster} disabled={creatingMaster || updatingMaster} className="mt-5 w-full rounded-xl bg-[#3554e0] px-4 py-3 text-sm font-semibold text-white disabled:bg-blue-300">{masterDraft.id ? "Save Master Service" : "Create Master Service"}</button>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-5 flex items-center gap-3">
              <IconBadge><HiOutlineSwatch className="h-5 w-5" /></IconBadge>
              <h3 className="text-base font-semibold text-slate-900">Manage subcategories</h3>
            </div>
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Master Service Selector
              <select value={categoryDraft.masterCategoryId || selectedMasterId} onChange={(e) => { const value = e.target.value; setSelectedMasterId(value); setCategoryDraft((prev) => ({ ...prev, masterCategoryId: value })); }} className="mt-2 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none">
                <option value="">Plumbing Services</option>
                {masters.map((master) => <option key={master.id} value={master.id}>{master.name}</option>)}
              </select>
            </label>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Subcategory Name<input value={categoryDraft.name} onChange={(e) => setCategoryDraft((prev) => ({ ...prev, name: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none" placeholder="e.g. Deep Cleaning" /></label>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Slug<input value={categoryDraft.slug} onChange={(e) => setCategoryDraft((prev) => ({ ...prev, slug: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none" placeholder="deep-cleaning" /></label>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Sort Order<input type="number" value={categoryDraft.sortOrder} onChange={(e) => setCategoryDraft((prev) => ({ ...prev, sortOrder: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none" /></label>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Icon Key<input value={categoryDraft.icon} onChange={(e) => setCategoryDraft((prev) => ({ ...prev, icon: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none" placeholder="material-icon-name" /></label>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full bg-[#3554e0]" /><span className="text-sm font-medium text-slate-700">Active Status</span></div>
              <button type="button" onClick={() => setCategoryDraft((prev) => ({ ...prev, isActive: !prev.isActive }))} className={`flex h-8 w-14 items-center rounded-full p-1 ${categoryDraft.isActive ? "bg-[#3554e0]" : "bg-slate-300"}`}><span className={`h-6 w-6 rounded-full bg-white shadow-sm transition ${categoryDraft.isActive ? "translate-x-6" : "translate-x-0"}`} /></button>
            </div>
            <button type="button" onClick={saveCategory} disabled={creatingCategory || updatingCategory} className="mt-5 w-full rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:bg-slate-300">{categoryDraft.id ? "Save Subcategory" : "Add Subcategory"}</button>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBadge><HiOutlineBolt className="h-5 w-5" /></IconBadge>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Existing Master Services</h3>
                <p className="text-sm text-slate-500">{masters.length} active services</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {isMastersLoading ? (
              <p className="text-sm text-slate-500">Loading master services...</p>
            ) : masters.length === 0 ? (
              <p className="text-sm text-slate-500">No master services created yet.</p>
            ) : (
              masters.map((master) => (
                <div key={master.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#3554e0] shadow-sm"><HiOutlineBolt className="h-5 w-5" /></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{master.name}</p>
                        <p className="text-xs text-slate-500">slug: {master.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => handleMasterEdit(master)} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">Edit</button>
                      <button type="button" onClick={() => handleMasterDelete(master.id)} disabled={deletingMaster} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-rose-700 shadow-sm">Delete</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-slate-900">Subcategories</h3>
            <p className="text-sm text-slate-500">Manage subcategories under a master service.</p>
          </div>
          <div className="space-y-3">
            {!selectedMaster ? (
              <p className="text-sm text-slate-500">Select a master service to view subcategories.</p>
            ) : visibleCategories.length === 0 ? (
              <p className="text-sm text-slate-500">No subcategories added for this master service.</p>
            ) : (
              visibleCategories.map((category) => (
                <div key={category.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{category.name}</p>
                      <p className="text-xs text-slate-500">{category.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => handleCategoryEdit(category)} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">Edit</button>
                      <button type="button" onClick={() => handleCategoryDelete(category.id)} disabled={deletingCategory} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-rose-700 shadow-sm">Delete</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </section>
    </DashboardContainer>
  );
}
