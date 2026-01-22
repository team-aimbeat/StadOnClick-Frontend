import { FormEvent, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { HiOutlinePlus, HiOutlineXMark } from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useCreateCouponMutation, useGetCouponsQuery } from "@/services/vendoiCouponsApi";

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

const VendorCoupons = () => {
  const dispatch = useAppDispatch();

  const { data: coupons = [], isLoading, isError, error } =
    useGetCouponsQuery();

  const [createCoupon] = useCreateCouponMutation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    title: "",
    discount: 10,
    minOrder: 0,
    maxUses: 10,
    expiry: "",
  });

  useEffect(() => {
    dispatch(setPageTitle("Coupons"));
  }, [dispatch]);

  const activeCoupon = useMemo(
    () => coupons.find((c) => c.status === "ACTIVE") ?? coupons[0],
    [coupons]
  );

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: Partial<Coupon> = {
      code: form.code.toUpperCase().replace(/\s+/g, ""),
      title: form.title,
      discount: form.discount,
      minOrder: form.minOrder,
      maxUses: form.maxUses,
      expiry: form.expiry,
      status: "ACTIVE",
      preview: `${form.title} · ${form.discount}% off`,
    };

    try {
      await createCoupon(payload).unwrap();
      setDrawerOpen(false);
      setForm({
        code: "",
        title: "",
        discount: 10,
        minOrder: 0,
        maxUses: 10,
        expiry: "",
      });
    } catch (err) {
      console.error("Failed to create coupon", err);
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
            onClick={() => setDrawerOpen(true)}
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
            <div className="relative flex w-full max-w-md items-stretch gap-3 rounded-[26px]  bg-gradient-to-r from-slate-900 to-red-600 text-white ">
              <div className="pointer-events-none absolute left-[-18px] top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full  border-white bg-white" />
              <div className="pointer-events-none absolute right-[-14px] top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full border-2 border-white bg-white" />
              <div className="flex w-35 flex-col items-center justify-between  bg-slate-100 px-3 py-4 text-center font-black text-slate-900">
                <span className="text-[10px] uppercase tracking-[0.4em]">SHOPPING COUPON</span>
                <span className="text-4xl leading-none">{activeCoupon?.discount ?? 0}%</span>
                <span className="text-[11px] uppercase tracking-[0.4em] text-slate-500">OFF</span>
              </div>
              <div className="flex w-3/4 flex-col justify-center gap-2 px-5 py-4 text-left">
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                  REALLYGREATSITE.COM
                </p>
                <p className="text-3xl font-black uppercase tracking-[0.3em]">COUPON</p>
                <p className="text-[12px] uppercase tracking-[0.35em] text-white/80">
                  Valid until <span className="font-semibold">{activeCoupon?.expiry ?? "DECEMBER 2023"}</span>
                </p>
                <p className="text-[14px] tracking-[0.2em] text-white/80">
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coupons.map((coupon) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40">
          <div className="h-full w-full max-w-md overflow-auto rounded-l-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                New coupon
              </p>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <HiOutlineXMark className="h-5 w-5" />
              </button>
            </div>

            <form className="mt-4 space-y-3" onSubmit={handleCreate}>
              <input
                placeholder="Code"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                placeholder="Title"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="Discount %"
                  value={form.discount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      discount: Number(e.target.value),
                    })
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Min order"
                  value={form.minOrder}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      minOrder: Number(e.target.value),
                    })
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Max uses"
                  value={form.maxUses}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      maxUses: Number(e.target.value),
                    })
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>
              <input
                type="date"
                value={form.expiry}
                onChange={(e) =>
                  setForm({ ...form, expiry: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Publish coupon
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardContainer>
  );
};

export default VendorCoupons;
