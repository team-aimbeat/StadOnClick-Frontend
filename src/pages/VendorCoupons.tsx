import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { HiEye, HiEyeSlash, HiOutlinePlus } from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useCreateCouponMutation, useGetCouponsQuery } from "@/services/vendoiCouponsApi";
import { CouponDialog, CouponFormValues } from "@/components/modals/CouponDialog";

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

const gradientClasses = [
  "from-slate-900 to-red-600",
  "from-slate-900 to-fuchsia-600",
  "from-sky-900 to-emerald-600",
  "from-red-900 to-amber-500",
];

const VendorCoupons = () => {
  const dispatch = useAppDispatch();

  const { data: coupons = [], isLoading, isError, error } =
    useGetCouponsQuery();

  const [createCoupon] = useCreateCouponMutation();
  const [previewCouponCode, setPreviewCouponCode] = useState<string>();
  const [previewGradient, setPreviewGradient] = useState(gradientClasses[0]);
  const handlePreview = (couponCode: string, index: number) => {
    setPreviewCouponCode(couponCode);
    setPreviewGradient(gradientClasses[index % gradientClasses.length]);
  };

  const activeCoupon = useMemo(() => {
    const target =
      previewCouponCode
        ? coupons.find((c) => c.code === previewCouponCode)
        : coupons.find((c) => c.status === "ACTIVE");

    return target ?? coupons[0];
  }, [coupons, previewCouponCode]);

  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(setPageTitle("Coupons"));
  }, [dispatch]);

  useEffect(() => {
    if (!activeCoupon) {
      setPreviewGradient(gradientClasses[0]);
      return;
    }

    const index = coupons.findIndex((coupon) => coupon.code === activeCoupon.code);
    const gradient = gradientClasses[index % gradientClasses.length] ?? gradientClasses[0];
    setPreviewGradient(gradient);
  }, [activeCoupon, coupons]);

  useEffect(() => {
    if (!previewCouponCode && coupons.length) {
      const fallback = coupons.find((coupon) => coupon.status === "ACTIVE") ?? coupons[0];
      setPreviewCouponCode(fallback?.code);
    }
  }, [coupons, previewCouponCode]);

  const handleCreateCoupon = async (
    values: CouponFormValues,
  ): Promise<string | undefined> => {
    const payload: Partial<Coupon> = {
      code: values.code.toUpperCase().replace(/\s+/g, ""),
      title: values.title,
      discount: values.discount,
      minOrder: values.minOrder,
      maxUses: values.maxUses,
      expiry: values.expiry,
      status: "ACTIVE",
      preview: `${values.title} � ${values.discount}% off`,
    };

    try {
      const newCoupon = await createCoupon(payload).unwrap();
      setPreviewCouponCode(newCoupon.code);
      return undefined;
    } catch (err) {
      console.error("Failed to create coupon", err);
      return (err as any)?.data?.message || "Failed to create coupon";
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">
          Active coupons
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300"
          >
            <HiOutlinePlus className="h-4 w-4" />
            Create coupon
          </button>
          <NavLink
            to="/vendor/promote"
            className="text-xs font-semibold text-blue-600 hover:text-blue-500"
          >
            Promote coupons
          </NavLink>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl  bg-white p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Preview
          </p>
          <div className="mt-4 flex items-center justify-center">
            <div
              className={`relative flex w-full max-w-md items-stretch gap-3 rounded-[26px] bg-gradient-to-r ${previewGradient} text-white`}
            >
              <div className="pointer-events-none absolute left-[-18px] top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full  bg-white" />
              <div className="pointer-events-none absolute right-[-18px] top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full  bg-white" />
                           <div
  className="absolute right-0 top-1 bottom-1 w-[288px]"
  style={{
    backgroundImage: "radial-gradient(circle,  #facc15 4px, transparent 2px)",
    backgroundSize: "15px 12px",
    backgroundRepeat: "repeat-y",
  }}
/>
              <div className="flex w-35 flex-col items-center  justify-between  bg-slate-100 px-3 py-4 text-center font-black text-slate-900">


                <span className="text-[10px] uppercase tracking-[0.4em]">SHOPPING COUPON</span>
                <span className="text-4xl leading-none">{activeCoupon?.discount ?? 0}%</span>
                <span className="text-[11px] uppercase tracking-[0.4em] text-slate-500">OFF</span>
              </div>
              <div className="flex w-3/4 flex-col justify-center gap-2 px-5 py-4 text-left">
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                  STADONCLICK.COM
                </p>
                <p className="text-3xl font-black uppercase tracking-[0.3em]">COUPON</p>
                <p className="text-[12px] uppercase tracking-[0.35em] text-white/80">
                  Valid until <span className="font-semibold">{activeCoupon?.expiry ?? "DECEMBER 2023"}</span>
                </p>
                <p className="text-[14px]  tracking-[0.2em] text-white/80">
                  Code: {activeCoupon?.code ?? "CODE"}
                </p>
              </div>
          
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="px-4 py-3 text-xs uppercase tracking-[0.3em] text-slate-400">
              Coupons
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Code</th>
                      <th className="px-4 py-3 text-left">Title</th>
                      <th className="px-4 py-3 text-left">Discount</th>
                      <th className="px-4 py-3 text-left">Min order</th>
                      <th className="px-4 py-3 text-left">Uses</th>
                      <th className="px-4 py-3 text-left">Expiry</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coupons.map((coupon, index) => (
                    <tr key={coupon.code}>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {coupon.code}
                      </td>
                      <td className="px-4 py-3">{coupon.title}</td>
                      <td className="px-4 py-3">{coupon.discount}%</td>
                      <td className="px-4 py-3">₹{coupon.minOrder}</td>
                      <td className="px-4 py-3">{coupon.maxUses}</td>
                      <td className="px-4 py-3">{coupon.expiry}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            coupon.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : coupon.status === "EXPIRED"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {coupon.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handlePreview(coupon.code, index)}
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                            previewCouponCode === coupon.code
                              ? "border-white bg-white text-slate-900"
                              : "border-transparent bg-white/10 text-white hover:border-white hover:bg-white/20"
                          }`}
                        >
                         <HiEye className="h-5 w-5"/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>


      <CouponDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateCoupon}
      />
    </DashboardContainer>
  );
};

export default VendorCoupons;

