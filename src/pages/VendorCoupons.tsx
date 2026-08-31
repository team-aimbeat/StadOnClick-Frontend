import { useEffect, useMemo, useState, type MouseEvent } from "react";
import {
  HiEye,
  HiOutlineArrowPath,
  HiOutlinePencilSquare,
  HiOutlinePlus,
} from "react-icons/hi2";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { DashboardContainer } from "@/components/dashboard";
import { CouponDialog, type CouponFormValues } from "@/components/modals/CouponDialog";
import { CouponPreviewDialog } from "@/components/modals/CouponPreviewDialog";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { DataTable, type RowData } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import {
  useCreateCouponMutation,
  useDisableCouponMutation,
  useGetCouponsQuery,
} from "@/services/vendoiCouponsApi";
import { useGetVendorProfileStatusQuery } from "@/services/vendorServicesApi";

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

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const statusTone: Record<
  Coupon["status"],
  { label: string; className: string; dotClassName: string }
> = {
  ACTIVE: {
    label: "Active",
    className: "border-emerald-100 bg-emerald-50 text-emerald-700",
    dotClassName: "bg-emerald-500",
  },
  EXPIRED: {
    label: "Expired",
    className: "border-slate-100 bg-slate-50 text-slate-500",
    dotClassName: "bg-slate-400",
  },
  DISABLED: {
    label: "Disabled",
    className: "border-amber-100 bg-amber-50 text-amber-700",
    dotClassName: "bg-amber-500",
  },
};

const formatMinOrder = (value: number) => currency.format(value || 0);
const formatExpiry = (value: string) => dayjs(value).format("DD MMM YYYY");

const VendorCoupons = () => {
  const dispatch = useAppDispatch();
  const vendorId = useAppSelector((state) => state.auth.user?.id);

  const { data: coupons = [], isLoading, isError, error, refetch } = useGetCouponsQuery();
  useGetVendorProfileStatusQuery();
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
        <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
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

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black">
            Active coupons
          </p>
          <p className="text-sm text-slate-500">
            Create, preview, and promote offers for your services.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <HiOutlinePlus className="mr-2 h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      <DataTable
        title="Coupons"
        breadCrumbTitle="Vendor / Coupons"
        data={derivedCoupons}
        loading={isLoading}
        showHeaderTitle={false}
        showSerialNumber
        searchable={false}
        selectable={false}
        columns={[
          {
            key: "code",
            title: "Code",
            render: (value: string) => (
              <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[13px] font-bold tracking-[0.12em] text-blue-600">
                {value}
              </span>
            ),
          },
          {
            key: "title",
            title: "Title",
            render: (value: string) => (
              <span className="text-[15px] font-semibold text-slate-900">{value}</span>
            ),
          },
          {
            key: "discount",
            title: "Discount",
            render: (value: number) => (
              <span className="text-[15px] font-semibold text-slate-900">{value}%</span>
            ),
          },
          {
            key: "minOrder",
            title: "Min Order",
            render: (value: number) => (
              <span className="text-[15px] font-semibold text-slate-700">
                {formatMinOrder(value)}
              </span>
            ),
          },
          {
            key: "maxUses",
            title: "Uses",
            render: (value: number) => (
              <span className="text-[15px] font-semibold text-slate-700">
                {value.toLocaleString()}
              </span>
            ),
          },
          {
            key: "expiry",
            title: "Expiry",
            render: (value: string) => (
              <span className="text-[15px] font-semibold text-slate-700">
                {formatExpiry(value)}
              </span>
            ),
          },
          {
            key: "status",
            title: "Status",
            render: (value: Coupon["status"]) => {
              const tone = statusTone[value];
              return (
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                    tone.className
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", tone.dotClassName)} />
                  {tone.label}
                </span>
              );
            },
          },
          {
            key: "actions",
            title: "Actions",
            render: (_: unknown, row: RowData, index: number) => {
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
                <div className="relative flex items-center justify-start">
                  <button
                    type="button"
                    onClick={toggleMenu}
                    aria-label="Row actions"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    <HiOutlinePencilSquare className="h-4 w-4" />
                  </button>
                  {isMenuOpen && (
                    <div
                      className="absolute left-0 top-full z-10 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={handlePreviewClick}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <HiEye className="h-4 w-4" />
                        Preview
                      </button>
                      {coupon.status === "ACTIVE" && (
                        <button
                          type="button"
                          onClick={handleDeactivateClick}
                          disabled={deactivatingCoupon === coupon.code}
                          className={cn(
                            "flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium transition",
                            deactivatingCoupon === coupon.code
                              ? "cursor-wait text-slate-400"
                              : "text-amber-700 hover:bg-amber-50"
                          )}
                        >
                          <HiOutlineArrowPath className="h-4 w-4" />
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
