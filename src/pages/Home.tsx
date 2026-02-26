import { Suspense, lazy, useEffect, useState } from "react";
import HomeHero from "@/components/shared/home/HomeHero";
import HomeCategories from "@/components/shared/home/HomeCategories";
import Blogs from "@/components/shared/home/Blogs";
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

type HeroDynamicContent = {
  heading?: string;
  subheading?: string;
  banners?: string[];
  popularChips?: Array<{ label: string; slug: string }>;
};

const HERO_BANNER_COUNT = 7;
const ADVERTISE_IMAGE_COUNT = 5;

function normalizeHeroBanners(input: unknown): string[] {
  const raw = Array.isArray(input) ? input.map((item) => String(item || "")) : [];
  return Array.from({ length: HERO_BANNER_COUNT }, (_, index) => raw[index] ?? "");
}

function normalizeAdvertiseImages(input: unknown): string[] {
  const raw = Array.isArray(input) ? input.map((item) => String(item || "")) : [];
  return Array.from({ length: ADVERTISE_IMAGE_COUNT }, (_, index) => raw[index] ?? "");
}

type AdvertiseDynamicContent = {
  images: string[];
  [key: string]: unknown;
};

function toHeroContentFromPayload(payload: unknown): HeroDynamicContent | null {
  if (!payload || typeof payload !== "object") return null;
  const content = payload as Record<string, unknown>;

  if (content.homeHero && typeof content.homeHero === "object") {
    const hero = content.homeHero as Record<string, unknown>;
    return {
      heading: typeof hero.heading === "string" ? hero.heading : undefined,
      subheading: typeof hero.subheading === "string" ? hero.subheading : undefined,
      banners: normalizeHeroBanners(hero.banners),
      popularChips: Array.isArray(hero.popularChips)
        ? hero.popularChips
            .map((item) => {
              const chip = item as Record<string, unknown>;
              return {
                label: typeof chip?.label === "string" ? chip.label : "",
                slug: typeof chip?.slug === "string" ? chip.slug : "",
              };
            })
            .filter((chip) => chip.label && chip.slug)
        : undefined,
    };
  }

  if (Array.isArray(content.sections)) {
    const heroSection = (content.sections as Array<Record<string, unknown>>).find(
      (section) => section?.type === "hero",
    );
    if (!heroSection) return null;
    const sectionTitle = typeof heroSection.title === "string" ? heroSection.title : undefined;
    const sectionSubtitle = typeof heroSection.subtitle === "string" ? heroSection.subtitle : undefined;
    const sectionData =
      heroSection.data && typeof heroSection.data === "object"
        ? (heroSection.data as Record<string, unknown>)
        : {};

    return {
      heading:
        typeof sectionData.heading === "string" ? sectionData.heading : sectionTitle,
      subheading:
        typeof sectionData.subheading === "string" ? sectionData.subheading : sectionSubtitle,
      banners: normalizeHeroBanners(sectionData.banners),
      popularChips: Array.isArray(sectionData.popularChips)
        ? sectionData.popularChips
            .map((item) => {
              const chip = item as Record<string, unknown>;
              return {
                label: typeof chip?.label === "string" ? chip.label : "",
                slug: typeof chip?.slug === "string" ? chip.slug : "",
              };
            })
            .filter((chip) => chip.label && chip.slug)
        : undefined,
    };
  }

  return null;
}

export default function Home() {
  const dispatch = useAppDispatch();
  const [heroContent, setHeroContent] = useState<HeroDynamicContent | null>(null);
  const [advertiseContent, setAdvertiseContent] = useState<AdvertiseDynamicContent>({
    images: normalizeAdvertiseImages(undefined),
  });

  useEffect(() => {
    dispatch(setPageTitle("Home"));
  }, [dispatch]);

  useEffect(() => {
    let ignore = false;

    const previewPayload = (window as any).__HOME_CONTENT_PREVIEW__;
    const previewHero = toHeroContentFromPayload(previewPayload);
    if (!ignore && previewHero) {
      setHeroContent(previewHero);
    }
    if (!ignore && previewPayload && typeof previewPayload === "object") {
      const addvertise = (previewPayload as Record<string, unknown>).addvertise;
      if (addvertise && typeof addvertise === "object") {
        const next = addvertise as Record<string, unknown>;
        setAdvertiseContent({
          ...next,
          images: normalizeAdvertiseImages(next.images),
        });
      }
    }

    const loadHero = async () => {
      try {
        const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
        if (!baseUrl) return;

        const cmsResponse = await fetch(`${baseUrl}/pages/home`, {
          credentials: "include",
        });
        if (cmsResponse.ok) {
          const cmsPayload = await cmsResponse.json();
          const cmsHero = toHeroContentFromPayload(cmsPayload);
          if (!ignore && cmsHero) {
            setHeroContent(cmsHero);
          }
          if (!ignore && cmsPayload && typeof cmsPayload === "object") {
            const addvertise = (cmsPayload as Record<string, unknown>).addvertise;
            if (addvertise && typeof addvertise === "object") {
              const next = addvertise as Record<string, unknown>;
              setAdvertiseContent({
                ...next,
                images: normalizeAdvertiseImages(next.images),
              });
            }
          }
          return;
        }

        const legacyResponse = await fetch(`${baseUrl}/home-content`, {
          credentials: "include",
        });
        if (!legacyResponse.ok) return;
        const legacyPayload = await legacyResponse.json();
        const legacyHero = toHeroContentFromPayload(legacyPayload);
        if (!ignore && legacyHero) {
          setHeroContent(legacyHero);
        }
        if (!ignore && legacyPayload && typeof legacyPayload === "object") {
          const addvertise = (legacyPayload as Record<string, unknown>).addvertise;
          if (addvertise && typeof addvertise === "object") {
            const next = addvertise as Record<string, unknown>;
            setAdvertiseContent({
              ...next,
              images: normalizeAdvertiseImages(next.images),
            });
          }
        }
      } catch {
        // Keep static defaults when dynamic sources are unavailable.
      }
    };

    void loadHero();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const applyPayload = (payload: unknown) => {
      const nextHero = toHeroContentFromPayload(payload);
      if (nextHero) setHeroContent(nextHero);
      if (payload && typeof payload === "object") {
        const addvertise = (payload as Record<string, unknown>).addvertise;
        if (addvertise && typeof addvertise === "object") {
          const next = addvertise as Record<string, unknown>;
          setAdvertiseContent({
            ...next,
            images: normalizeAdvertiseImages(next.images),
          });
        }
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; payload?: unknown };
      if (data?.type !== "HOME_CONTENT_PREVIEW") return;
      applyPayload(data.payload);
    };

    window.addEventListener("message", handleMessage);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel("home-content-preview");
      channel.onmessage = (event) => {
        const data = event.data as { type?: string; payload?: unknown };
        if (data?.type !== "HOME_CONTENT_PREVIEW") return;
        applyPayload(data.payload);
      };
    }

    return () => {
      window.removeEventListener("message", handleMessage);
      channel?.close();
    };
  }, []);

  return (
    <div className="overflow-x-hidden text-slate-900">
      <div className="mx-auto w-full max-w-387.5  px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <HomeHero
          heading={heroContent?.heading}
          subheading={heroContent?.subheading}
          banners={heroContent?.banners}
          popularChips={heroContent?.popularChips}
        />
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
            <Addvertise content={advertiseContent} />
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

        <LazySection minHeight={340}>
          <Suspense fallback={<SectionSkeleton height={340} />}>
            <HomeMind />
          </Suspense>
        </LazySection>

        <LazySection minHeight={400}>
          <Suspense fallback={<SectionSkeleton height={400} />}>
            <HomeTravel />
          </Suspense>
        </LazySection>

        <LazySection minHeight={500}>
          <Suspense fallback={<SectionSkeleton height={500} />}>
            <Blogs />
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
