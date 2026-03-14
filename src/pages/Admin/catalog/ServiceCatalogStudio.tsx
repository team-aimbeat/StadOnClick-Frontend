import { useMemo, useState } from "react";
import toast from "react-hot-toast";

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
  type AdminServiceMasterCategory,
  type AdminMasterServiceRequest,
  type AdminCategoryServiceRequest,
  type AdminServiceSubCategory,
} from "@/features/admin/service-categories/api/adminServiceCategoriesApi";

type MasterDraft = {
  id?: string;
  name: string;
  slug: string;
  icon: string;
  sortOrder: string;
  isActive: boolean;
};

type CategoryDraft = {
  id?: string;
  masterCategoryId: string;
  name: string;
  slug: string;
  icon: string;
  sortOrder: string;
  isActive: boolean;
};

const emptyMasterDraft: MasterDraft = {
  name: "",
  slug: "",
  icon: "",
  sortOrder: "0",
  isActive: true,
};

const emptyCategoryDraft: CategoryDraft = {
  masterCategoryId: "",
  name: "",
  slug: "",
  icon: "",
  sortOrder: "0",
  isActive: true,
};

export default function ServiceCatalogStudio() {
  const { data: masters = [], isLoading } = useListAdminServiceMastersQuery();
  const { data: masterRequests = [], isLoading: isRequestsLoading } =
    useListAdminMasterServiceRequestsQuery();
  const { data: categoryRequests = [], isLoading: isCategoryRequestsLoading } =
    useListAdminCategoryServiceRequestsQuery();
  const [selectedMasterId, setSelectedMasterId] = useState<string>("");

  const [masterDraft, setMasterDraft] = useState<MasterDraft>(emptyMasterDraft);
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft>(emptyCategoryDraft);

  const [createMaster, { isLoading: creatingMaster }] = useCreateAdminServiceMasterMutation();
  const [updateMaster, { isLoading: updatingMaster }] = useUpdateAdminServiceMasterMutation();
  const [deleteMaster, { isLoading: deletingMaster }] = useDeleteAdminServiceMasterMutation();
  const [createCategory, { isLoading: creatingCategory }] = useCreateAdminServiceCategoryMutation();
  const [updateCategory, { isLoading: updatingCategory }] = useUpdateAdminServiceCategoryMutation();
  const [deleteCategory, { isLoading: deletingCategory }] = useDeleteAdminServiceCategoryMutation();
  const [reviewRequest, { isLoading: reviewingRequest }] =
    useReviewAdminMasterServiceRequestMutation();
  const [reviewCategoryRequest, { isLoading: reviewingCategoryRequest }] =
    useReviewAdminCategoryServiceRequestMutation();

  const selectedMaster = useMemo(
    () => masters.find((master) => master.id === selectedMasterId),
    [masters, selectedMasterId],
  );

  const visibleCategories = selectedMaster?.categories ?? [];
  const pendingRequests = masterRequests.filter((request) => request.status === "PENDING");
  const pendingCategoryRequests = categoryRequests.filter((request) => request.status === "PENDING");

  const handleReviewRequest = async (
    request: AdminMasterServiceRequest,
    status: "APPROVED" | "REJECTED",
  ) => {
    try {
      await reviewRequest({
        id: request.id,
        body: {
          status,
          icon: request.icon ?? undefined,
          sortOrder: request.sortOrder ?? 0,
          isActive: true,
        },
      }).unwrap();
      toast.success(
        status === "APPROVED"
          ? "Master service request approved."
          : "Master service request rejected.",
      );
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to review request.");
    }
  };

  const handleReviewCategoryRequest = async (
    request: AdminCategoryServiceRequest,
    status: "APPROVED" | "REJECTED",
  ) => {
    try {
      await reviewCategoryRequest({
        id: request.id,
        body: {
          status,
          icon: request.icon ?? undefined,
          sortOrder: request.sortOrder ?? 0,
          isActive: true,
        },
      }).unwrap();
      toast.success(
        status === "APPROVED"
          ? "Category request approved."
          : "Category request rejected.",
      );
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

  const handleMasterSave = async () => {
    if (!masterDraft.name.trim()) {
      toast.error("Master service name is required.");
      return;
    }
    const payload = {
      name: masterDraft.name.trim(),
      slug: masterDraft.slug.trim() || undefined,
      icon: masterDraft.icon.trim() || undefined,
      sortOrder: Number(masterDraft.sortOrder || 0),
      isActive: masterDraft.isActive,
    };
    try {
      if (masterDraft.id) {
        await updateMaster({ id: masterDraft.id, body: payload }).unwrap();
        toast.success("Master service updated.");
      } else {
        await createMaster(payload).unwrap();
        toast.success("Master service created.");
      }
      setMasterDraft(emptyMasterDraft);
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to save master service.");
    }
  };

  const handleMasterDelete = async (id: string) => {
    if (!window.confirm("Delete this master service and all linked subcategories?")) return;
    try {
      await deleteMaster(id).unwrap();
      if (selectedMasterId === id) {
        setSelectedMasterId("");
      }
      if (masterDraft.id === id) {
        setMasterDraft(emptyMasterDraft);
      }
      toast.success("Master service deleted.");
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to delete master service.");
    }
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

  const handleCategorySave = async () => {
    if (!categoryDraft.masterCategoryId) {
      toast.error("Select a master service first.");
      return;
    }
    if (!categoryDraft.name.trim()) {
      toast.error("Subcategory name is required.");
      return;
    }
    const payload = {
      masterCategoryId: categoryDraft.masterCategoryId,
      name: categoryDraft.name.trim(),
      slug: categoryDraft.slug.trim() || undefined,
      icon: categoryDraft.icon.trim() || undefined,
      sortOrder: Number(categoryDraft.sortOrder || 0),
      isActive: categoryDraft.isActive,
    };

    try {
      if (categoryDraft.id) {
        await updateCategory({ id: categoryDraft.id, body: payload }).unwrap();
        toast.success("Subcategory updated.");
      } else {
        await createCategory(payload).unwrap();
        toast.success("Subcategory created.");
      }
      setCategoryDraft((prev) => ({
        ...emptyCategoryDraft,
        masterCategoryId: prev.masterCategoryId || selectedMasterId || "",
      }));
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to save subcategory.");
    }
  };

  const handleCategoryDelete = async (id: string) => {
    if (!window.confirm("Delete this subcategory?")) return;
    try {
      await deleteCategory(id).unwrap();
      if (categoryDraft.id === id) {
        setCategoryDraft((prev) => ({
          ...emptyCategoryDraft,
          masterCategoryId: prev.masterCategoryId || selectedMasterId || "",
        }));
      }
      toast.success("Subcategory deleted.");
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to delete subcategory.");
    }
  };

  return (
    <DashboardContainer className="space-y-6">
      <TitleBreadCrumbs
        title="Service Master Studio"
        breadCrumbTitle="Admin / Catalog / Service Masters"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Approval queue
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                Vendor master service requests
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {pendingRequests.length} pending
            </span>
          </div>

          <div className="space-y-3">
            {isRequestsLoading ? (
              <p className="text-sm text-slate-500">Loading approval requests...</p>
            ) : masterRequests.length === 0 ? (
              <p className="text-sm text-slate-500">No vendor requests submitted yet.</p>
            ) : (
              masterRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{request.name}</p>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          {request.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {request.slug} • {request.vendor.businessName} • {request.requestedByUser.email}
                      </p>
                      {request.adminNotes && (
                        <p className="text-xs text-slate-600">Admin note: {request.adminNotes}</p>
                      )}
                      {request.approvedMasterCategory && (
                        <p className="text-xs text-emerald-700">
                          Linked master: {request.approvedMasterCategory.name}
                        </p>
                      )}
                    </div>

                    {request.status === "PENDING" ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleReviewRequest(request, "APPROVED")}
                          disabled={reviewingRequest}
                          className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewRequest(request, "REJECTED")}
                          disabled={reviewingRequest}
                          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Category queue
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                Vendor service category requests
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {pendingCategoryRequests.length} pending
            </span>
          </div>

          <div className="space-y-3">
            {isCategoryRequestsLoading ? (
              <p className="text-sm text-slate-500">Loading category requests...</p>
            ) : categoryRequests.length === 0 ? (
              <p className="text-sm text-slate-500">No vendor category requests submitted yet.</p>
            ) : (
              categoryRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{request.name}</p>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          {request.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {request.slug} • {request.masterCategory.name} • {request.vendor.businessName} • {request.requestedByUser.email}
                      </p>
                      {request.adminNotes && (
                        <p className="text-xs text-slate-600">Admin note: {request.adminNotes}</p>
                      )}
                      {request.approvedCategory && (
                        <p className="text-xs text-emerald-700">
                          Linked category: {request.approvedCategory.name}
                        </p>
                      )}
                    </div>

                    {request.status === "PENDING" ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleReviewCategoryRequest(request, "APPROVED")}
                          disabled={reviewingCategoryRequest}
                          className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewCategoryRequest(request, "REJECTED")}
                          disabled={reviewingCategoryRequest}
                          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Master services</p>
            <h2 className="text-lg font-semibold text-slate-900">Create and manage master services</h2>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              value={masterDraft.name}
              onChange={(e) => setMasterDraft((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Experiences & Activities"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Slug
              <input
                value={masterDraft.slug}
                onChange={(e) => setMasterDraft((prev) => ({ ...prev, slug: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="experiences-activities"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Sort order
              <input
                type="number"
                value={masterDraft.sortOrder}
                onChange={(e) => setMasterDraft((prev) => ({ ...prev, sortOrder: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Icon (optional)
              <input
                value={masterDraft.icon}
                onChange={(e) => setMasterDraft((prev) => ({ ...prev, icon: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="emoji or icon key"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 pt-7">
              <input
                type="checkbox"
                checked={masterDraft.isActive}
                onChange={(e) => setMasterDraft((prev) => ({ ...prev, isActive: e.target.checked }))}
              />
              Active
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMasterSave}
              disabled={creatingMaster || updatingMaster}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-blue-300"
            >
              {masterDraft.id ? "Save Master" : "Create Master"}
            </button>
            <button
              type="button"
              onClick={() => setMasterDraft(emptyMasterDraft)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Reset
            </button>
          </div>

          <div className="space-y-2 pt-2">
            {isLoading ? (
              <p className="text-sm text-slate-500">Loading master services...</p>
            ) : masters.length === 0 ? (
              <p className="text-sm text-slate-500">No master services created yet.</p>
            ) : (
              masters.map((master) => (
                <div
                  key={master.id}
                  className={`rounded-xl border px-3 py-2 ${
                    selectedMasterId === master.id
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMasterId(master.id);
                        setCategoryDraft((prev) => ({ ...prev, masterCategoryId: master.id }));
                      }}
                      className="text-left"
                    >
                      <p className="text-sm font-semibold text-slate-900">{master.name}</p>
                      <p className="text-xs text-slate-500">
                        {master.slug} • {(master._count?.categories ?? master.categories.length)} subcategories
                      </p>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMasterEdit(master)}
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMasterDelete(master.id)}
                        disabled={deletingMaster}
                        className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Subcategories</p>
            <h2 className="text-lg font-semibold text-slate-900">
              Manage subcategories under a master service
            </h2>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Master service
            <select
              value={categoryDraft.masterCategoryId || selectedMasterId}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedMasterId(value);
                setCategoryDraft((prev) => ({ ...prev, masterCategoryId: value }));
              }}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select master service</option>
              {masters.map((master) => (
                <option key={master.id} value={master.id}>
                  {master.name}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Subcategory name</label>
            <input
              value={categoryDraft.name}
              onChange={(e) => setCategoryDraft((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Kids & Family"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Slug
              <input
                value={categoryDraft.slug}
                onChange={(e) => setCategoryDraft((prev) => ({ ...prev, slug: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="kids-family"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Sort order
              <input
                type="number"
                value={categoryDraft.sortOrder}
                onChange={(e) => setCategoryDraft((prev) => ({ ...prev, sortOrder: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Icon (optional)
              <input
                value={categoryDraft.icon}
                onChange={(e) => setCategoryDraft((prev) => ({ ...prev, icon: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="emoji or icon key"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 pt-7">
              <input
                type="checkbox"
                checked={categoryDraft.isActive}
                onChange={(e) => setCategoryDraft((prev) => ({ ...prev, isActive: e.target.checked }))}
              />
              Active
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCategorySave}
              disabled={creatingCategory || updatingCategory}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-blue-300"
            >
              {categoryDraft.id ? "Save Subcategory" : "Create Subcategory"}
            </button>
            <button
              type="button"
              onClick={() =>
                setCategoryDraft((prev) => ({
                  ...emptyCategoryDraft,
                  masterCategoryId: prev.masterCategoryId || selectedMasterId || "",
                }))
              }
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Reset
            </button>
          </div>

          <div className="space-y-2 pt-2">
            {!selectedMaster ? (
              <p className="text-sm text-slate-500">Select a master service to view subcategories.</p>
            ) : visibleCategories.length === 0 ? (
              <p className="text-sm text-slate-500">No subcategories added for this master service.</p>
            ) : (
              visibleCategories.map((category) => (
                <div key={category.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{category.name}</p>
                      <p className="text-xs text-slate-500">{category.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCategoryEdit(category)}
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCategoryDelete(category.id)}
                        disabled={deletingCategory}
                        className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </DashboardContainer>
  );
}
