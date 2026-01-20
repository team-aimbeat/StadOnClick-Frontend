import { FormEvent, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { HiOutlinePlus, HiOutlineXMark } from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useMockLoader } from "@/lib/useMockLoader";

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

const initialCoupons: Coupon[] = [
  {
    code: "URBANFIX10",
    title: "10% off on repairs",
    discount: 10,
    minOrder: 1000,
    maxUses: 50,
    expiry: "2025-02-15",
    status: "ACTIVE",
    preview: "UrbanFix 10% off on repairs · ₹1000 min order",
  },
  {
    code: "HEAT20",
    title: "20% off on heating services",
    discount: 20,
    minOrder: 1800,
    maxUses: 25,
    expiry: "2025-03-10",
    status: "DISABLED",
    preview: "20% off on heating services (Disabled)",
  },
  {
    code: "CLEAN25",
    title: "25% off deep cleaning",
    discount: 25,
    minOrder: 2500,
    maxUses: 10,
    expiry: "2024-12-31",
    status: "EXPIRED",
    preview: "25% off deep cleaning (Expired)",
  },
];

const VendorCoupons = () => {
  const dispatch = useAppDispatch();
  const loading = useMockLoader();
  const [coupons, setCoupons] = useState(initialCoupons);
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
    () => coupons.find((coupon) => coupon.status === "ACTIVE") ?? coupons[0],
    [coupons]
  );

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextCoupon: Coupon = {
      code: form.code.toUpperCase().replace(/\s+/g, ""),
      title: form.title,
      discount: form.discount,
      minOrder: form.minOrder,
      maxUses: form.maxUses,
      expiry: form.expiry,
      status: "ACTIVE",
      preview: `${form.title} · ${form.discount}% off`,
    };
    setCoupons((prev) => [nextCoupon, ...prev]);
    setDrawerOpen(false);
    setForm({
      code: "",
      title: "",
      discount: 10,
      minOrder: 0,
      maxUses: 10,
      expiry: "",
    });
  };

  if (loading) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <div className="h-8 w-1/4 animate-pulse rounded-full bg-slate-200" />
        <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-5 pb-10">
      <TitleBreadCrumbs title="Coupons" breadCrumbTitle="Vendor / Coupons" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">Active coupons</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300"
          >
            <HiOutlinePlus className="h-4 w-4" />
            Create coupon
          </button>
          <NavLink to="/vendor/promote" className="text-xs font-semibold text-blue-600 hover:text-blue-500">
            Promote coupons
          </NavLink>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Preview</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{activeCoupon?.title}</p>
          <p className="text-sm text-slate-600">{activeCoupon?.preview}</p>
          <div className="mt-3 space-y-1 text-xs text-slate-500">
            <p>Code: {activeCoupon?.code}</p>
            <p>Discount: {activeCoupon?.discount}%</p>
            <p>Min order: ₹{activeCoupon?.minOrder}</p>
            <p>Expires: {activeCoupon?.expiry}</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="px-4 py-3 text-xs uppercase tracking-[0.3em] text-slate-400">Coupons</div>
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
                      <td className="px-4 py-3 font-semibold text-slate-900">{coupon.code}</td>
                      <td className="px-4 py-3">{coupon.title}</td>
                      <td className="px-4 py-3 text-slate-900">{coupon.discount}%</td>
                      <td className="px-4 py-3 text-slate-900">₹{coupon.minOrder}</td>
                      <td className="px-4 py-3 text-slate-900">{coupon.maxUses}</td>
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
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">New coupon</p>
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
                onChange={(event) => setForm({ ...form, code: event.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                placeholder="Title"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-3 gap-2 text-sm">
                <input
                  type="number"
                  placeholder="Discount %"
                  value={form.discount}
                  onChange={(event) => setForm({ ...form, discount: Number(event.target.value) })}
                  className="rounded-xl border border-slate-200 px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Min order"
                  value={form.minOrder}
                  onChange={(event) => setForm({ ...form, minOrder: Number(event.target.value) })}
                  className="rounded-xl border border-slate-200 px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Max uses"
                  value={form.maxUses}
                  onChange={(event) => setForm({ ...form, maxUses: Number(event.target.value) })}
                  className="rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>
              <input
                type="date"
                value={form.expiry}
                onChange={(event) => setForm({ ...form, expiry: event.target.value })}
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
