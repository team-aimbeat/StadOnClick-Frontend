import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { HiEye, HiOutlinePlus } from "react-icons/hi2";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import {
  useCreateCouponMutation,
  useDisableCouponMutation,
  useGetCouponsQuery,
} from "@/services/vendoiCouponsApi";
import { useGetVendorProfileStatusQuery } from "@/services/vendorServicesApi";
import { CouponDialog, CouponFormValues } from "@/components/modals/CouponDialog";
import { CouponPreviewDialog } from "@/components/modals/CouponPreviewDialog";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import type { RowData } from "@/components/shared/DataTable";

type Coupon = {
  code: string;
  title: string;
  discount: number;
  minOrder: number;
  maxUses: number;
  expiry: string;
  status: "ACTIVE" | "EXPIRED" | "DISABLED";
  preview: string;
};
type CouponRow = Coupon & { id: string };

const gradientClasses = [
  "from-slate-900 to-red-600",
  "from-slate-900 to-fuchsia-600",
  "from-sky-900 to-emerald-600",
  "from-red-900 to-amber-500",
];

const VendorCoupons = () => {
  const dispatch = useAppDispatch();

  const { data: coupons = [], isLoading, isError, error, refetch } = useGetCouponsQuery();
  const { data: profileStatus } = useGetVendorProfileStatusQuery();
  const vendorId = profileStatus?.id;

  const [createCoupon] = useCreateCouponMutation();
  const [disableCoupon] = useDisableCouponMutation();
  const [previewCouponCode, setPreviewCouponCode] = useState<string>();
  const [previewGradient, setPreviewGradient] = useState(gradientClasses[0]);
  const [previewModalCoupon, setPreviewModalCoupon] = useState<CouponRow | null>(null);
  const [deactivatingCoupon, setDeactivatingCoupon] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openActionRow, setOpenActionRow] = useState<string | null>(null);

  const derivedCoupons = useMemo<CouponRow[]>(() => {
    const today = dayjs().startOf("day");
    return coupons
      .map((coupon) => {
        const isExpired = dayjs(coupon.expiry).isBefore(today, "day");
        return { ...coupon, status: isExpired ? "EXPIRED" : coupon.status, id: coupon.code };
      })
      .sort((a, b) => dayjs(b.expiry).valueOf() - dayjs(a.expiry).valueOf());
  }, [coupons]);

  const handlePreview = (coupon: CouponRow, index: number) => {
    setPreviewCouponCode(coupon.code);
    setPreviewGradient(gradientClasses[index % gradientClasses.length]);
    setPreviewModalCoupon(coupon);
  };

  const closePreviewModal = () => setPreviewModalCoupon(null);

  useEffect(() => {
    dispatch(setPageTitle("Coupons"));
  }, [dispatch]);

  const handleCreateCoupon = async (
    values: CouponFormValues,
  ): Promise<string | undefined> => {
    if (!vendorId) {
      return "Vendor profile not loaded yet. Please try again in a moment.";
    }

    const expiryDate = dayjs(values.expiry).endOf("day");
    if (!expiryDate.isValid()) {
      return "Please provide a valid expiry date.";
    }
    if (expiryDate.isBefore(dayjs(), "day")) {
      return "Expiry date must be today or in the future.";
    }

    const payload: Partial<Coupon> = {
      code: values.code.toUpperCase().replace(/\s+/g, ""),
      title: values.title,
      discount: values.discount,
      minOrder: values.minOrder,
      maxUses: values.maxUses,
      expiry: expiryDate.toISOString(),
      status: "ACTIVE",
      preview: `${values.title} - ${values.discount}% off`,
    };

    try {
      const newCoupon = await createCoupon(payload).unwrap();
      setPreviewCouponCode(newCoupon.code);
      toast.success("Coupon created successfully");
      await refetch();
      return undefined;
    } catch (err) {
      console.error("Failed to create coupon", err);
      return (err as any)?.data?.message || "Failed to create coupon";
    }
  };

  const handleDeactivateCoupon = async (code: string) => {
    if (deactivatingCoupon === code) {
      return;
    }

    setDeactivatingCoupon(code);

    try {
      await disableCoupon(code).unwrap();
      if (previewCouponCode === code) {
        setPreviewCouponCode(undefined);
      }
      toast.success("Coupon deactivated");
      await refetch();
    } catch (err) {
      console.error("Failed to deactivate coupon", err);
      toast.error((err as any)?.data?.message || "Failed to deactivate coupon");
    } finally {
      setDeactivatingCoupon(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <div className="h-8 w-1/4 animate-pulse rounded-full bg-slate-200" />
        <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
      </DashboardContainer>
    );
  }

  if (isError) {
    return (
      <DashboardContainer className="pt-8">
        <p className="text-sm text-red-500">
          {(error as any)?.data?.message || "Failed to load coupons"}
        </p>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-5 pb-10">
      <TitleBreadCrumbs title="Coupons" breadCrumbTitle="Vendor / Coupons" />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-slate-700">Active coupons</p>
          <p className="text-xs text-slate-500">Create, preview, and promote offers for your services.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setDialogOpen(true)}>
            <HiOutlinePlus className="mr-2 h-4 w-4" />
            Create Coupon
          </Button>
        </div>
      </div>

        <DataTable
          title="Coupons"
          breadCrumbTitle="Vendor / Coupons"
          data={derivedCoupons}
          loading={isLoading}
          columns={[
            {
              key: "code",
              title: "Code",
              render: (value) => (
                <span className="font-semibold text-slate-900">{value}</span>
              ),
            },
            {
              key: "title",
              title: "Title",
              render: (value: string) => <span className="text-sm text-slate-700">{value}</span>,
            },
            {
              key: "discount",
              title: "Discount",
              render: (value: number) => `${value}%`,
            },
            {
              key: "minOrder",
              title: "Min order",
              render: (value: number) => `₹${value}`,
            },
            {
              key: "maxUses",
              title: "Uses",
            },
            {
              key: "expiry",
              title: "Expiry",
              render: (value: string) => dayjs(value).format("DD MMM YYYY"),
            },
            {
              key: "status",
              title: "Status",
              render: (value: Coupon["status"]) => (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    value === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700"
                      : value === "EXPIRED"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {value}
                </span>
              ),
            },
            {
              key: "actions",
              title: "Actions",
                render: (_: any, row: RowData, index: number) => {
                  const coupon = row as CouponRow;
                  const isMenuOpen = openActionRow === coupon.code;

                  const toggleMenu = (event: MouseEvent<HTMLButtonElement>) => {
                    event.stopPropagation();
                    setOpenActionRow((prev) => (prev === coupon.code ? null : coupon.code));
                  };

                  const handlePreviewClick = () => {
                    handlePreview(coupon, index);
                    setOpenActionRow(null);
                  };

                  const handleDeactivateClick = () => {
                    handleDeactivateCoupon(coupon.code);
                    setOpenActionRow(null);
                  };

                  return (
                    <div className="relative flex items-center justify-center">
                      <button
                        type="button"
                        onClick={toggleMenu}
                        aria-label="Row actions"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold text-slate-700 transition hover:text-slate-900 hover:bg-slate-100"
                      >
                        <span className="leading-[1] text-2xl">⋮</span>
                      </button>
                      {isMenuOpen && (
                        <div
                          className="absolute right-0 top-full z-10 mt-1 w-36 divide-y divide-slate-100 rounded-md border border-slate-200 bg-white shadow-lg"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={handlePreviewClick}
                            className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Preview
                          </button>
                          {coupon.status === "ACTIVE" && (
                            <button
                              type="button"
                              onClick={handleDeactivateClick}
                              disabled={deactivatingCoupon === coupon.code}
                              className={`w-full px-4 py-2 text-left text-sm font-medium ${
                                deactivatingCoupon === coupon.code
                                  ? "text-slate-400 cursor-wait"
                                  : "text-amber-700 hover:bg-amber-50"
                              }`}
                            >
                              {deactivatingCoupon === coupon.code ? "Disabling..." : "Deactivate"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                },
            },
          ]}
        />
    

      <CouponDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateCoupon}
      />
      <CouponPreviewDialog
        open={Boolean(previewModalCoupon)}
        onOpenChange={(open) => {
          if (!open) {
            closePreviewModal();
          }
        }}
        coupon={previewModalCoupon ?? undefined}
        previewGradient={previewGradient}
      />
    </DashboardContainer>
  );
};

export default VendorCoupons;
