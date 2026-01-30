import { useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { DashboardContainer } from "@/components/dashboard"
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs"
import { setPageTitle } from "@/features/Layout/themeConfigSlice"
import { useAppDispatch } from "@/app/hooks"
import { plannedCategories } from "@/data/vendorServiceCategories"

const VendorCategoryDetail = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const category = slug ? plannedCategories.find((item) => item.slug === slug) : undefined

  useEffect(() => {
    dispatch(setPageTitle(category?.name ?? "Service category"))
  }, [dispatch, category])

  const handleStart = () => {
    if (!category) return
    navigate(`/vendor/services?category=${category.slug}&openWizard=true`)
  }

  if (!category) {
    return (
      <DashboardContainer className="px-4 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Category not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            We could not find that service category. Go back and pick a different one.
          </p>
          <Link
            to="/vendor/services"
            className="mt-6 inline-flex rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
          >
            Back to categories
          </Link>
        </div>
      </DashboardContainer>
    )
  }

  return (
    <DashboardContainer className="space-y-8 pb-16">
      <TitleBreadCrumbs title={category.name} breadCrumbTitle="Vendor / Services" />
      <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_60px_-30px_rgba(15,23,42,0.4)] p-6">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-2xl shadow-sm">
            <img
              src={category.image}
              alt={category.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <category.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Category</p>
                <h1 className="text-3xl font-semibold text-slate-900">{category.name}</h1>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Highlights
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {category.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Subcategories
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {category.subcategories.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/vendor/services"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              >
                ← Back to categories
              </Link>
              <button
                type="button"
                onClick={handleStart}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700"
              >
                Start building service
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardContainer>
  )
}

export default VendorCategoryDetail
