import { Suspense, lazy, useEffect } from "react";
import HomeHero from "@/components/shared/home/HomeHero";
import HomeCategories from "@/components/shared/home/HomeCategories";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import LazySection from "@/components/shared/LazySection";

const HomeDeal = lazy(() => import("@/components/shared/home/HomeDeal"));
const HomeDiscount = lazy(() => import("@/components/shared/home/HomeDiscount"));
const Addvertise = lazy(() => import("@/components/shared/home/Addvertise"));
const HomeTrending = lazy(() => import("@/components/shared/home/HomeTrending"));
const HomeCoupon = lazy(() => import("@/components/shared/home/HomeCoupon"));
const HomeMind = lazy(() => import("@/components/shared/home/HomeMind"));
const HomeTravel = lazy(() => import("@/components/shared/home/HomeTravel"));
const HomeSightseeing = lazy(() => import("@/components/shared/home/HomeSightseeing"));

function SectionSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div
      className="mt-6 w-full animate-pulse rounded-2xl bg-slate-100"
      style={{ height }}
      aria-hidden="true"
    />
  );
}

export default function Home() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setPageTitle("Home"));
  }, [dispatch]);

  return (
    <div className="overflow-x-hidden text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <HomeHero />
        <HomeCategories />

        <LazySection minHeight={280}>
          <Suspense fallback={<SectionSkeleton height={280} />}>
            <HomeDeal />
          </Suspense>
        </LazySection>

        <LazySection minHeight={280}>
          <Suspense fallback={<SectionSkeleton height={280} />}>
            <HomeDiscount />
          </Suspense>
        </LazySection>

        <LazySection minHeight={520}>
          <Suspense fallback={<SectionSkeleton height={520} />}>
            <Addvertise />
          </Suspense>
        </LazySection>

        <LazySection minHeight={560}>
          <Suspense fallback={<SectionSkeleton height={560} />}>
            <HomeTrending />
          </Suspense>
        </LazySection>

        <LazySection minHeight={180}>
          <Suspense fallback={<SectionSkeleton height={180} />}>
            <HomeCoupon />
          </Suspense>
        </LazySection>

        <LazySection minHeight={540}>
          <Suspense fallback={<SectionSkeleton height={540} />}>
            <HomeMind />
          </Suspense>
        </LazySection>

        <LazySection minHeight={900}>
          <Suspense fallback={<SectionSkeleton height={900} />}>
            <HomeTravel />
          </Suspense>
        </LazySection>

        <LazySection minHeight={620}>
          <Suspense fallback={<SectionSkeleton height={620} />}>
            <HomeSightseeing />
          </Suspense>
        </LazySection>
      </div>
    </div>
  )
}
