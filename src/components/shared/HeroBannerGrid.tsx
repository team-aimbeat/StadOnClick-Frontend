import { useState } from "react";
import { GripVertical, ImageIcon, Plus, Trash2, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type HeroBanner = {
  id: string;
  imageSrc: string;
  source: string;
};

export type HeroBannerGridProps = {
  banners: HeroBanner[];
  maxBanners?: number;
  onSourceChange: (bannerId: string, value: string) => void;
  onReplace: (bannerId: string, file: File) => void;
  onDelete: (bannerId: string) => void;
  onAddBanner: () => void;
};

type BannerCardProps = {
  banner: HeroBanner;
  index: number;
  onSourceChange: (value: string) => void;
  onReplace: (file: File) => void;
  onDelete: () => void;
};

export function BannerCard({
  banner,
  index,
  onSourceChange,
  onReplace,
  onDelete,
}: BannerCardProps) {
  const hasImage = banner.imageSrc.trim().length > 0;
  const isPrimary = index === 0;

  return (
    <Card className="group h-full min-h-[360px] gap-0 rounded-xl border-slate-200 py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Banner {index + 1}
            </Badge>
            {isPrimary && (
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                Primary
              </Badge>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-7 w-7 cursor-move items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Reorder banner"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          <div className="aspect-video w-full">
            {hasImage ? (
              <img
                src={banner.imageSrc}
                alt={`Banner ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageIcon className="h-5 w-5" />
                <p className="text-xs">No image uploaded</p>
              </div>
            )}
          </div>

          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  onReplace(file);
                  event.currentTarget.value = "";
                }}
              />
              <Button type="button" variant="secondary" size="sm" asChild>
                <span>
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Replace
                </span>
              </Button>
            </label>

            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span
              className={`h-2 w-2 rounded-full ${
                hasImage ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <span>{hasImage ? "Active" : "Draft"}</span>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <Label htmlFor={`banner-source-${banner.id}`} className="text-xs">
            Image Source
          </Label>
          <Input
            id={`banner-source-${banner.id}`}
            value={banner.source}
            onChange={(event) => onSourceChange(event.target.value)}
            placeholder="Paste image URL or base64"
            className="bg-white"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function AddBannerCard({ onAddBanner }: { onAddBanner: () => void }) {
  return (
    <button
      type="button"
      onClick={onAddBanner}
      className="flex min-h-[360px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-slate-500 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-slate-50 hover:shadow-xl"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-slate-50">
        <Plus className="h-5 w-5" />
      </span>
      <p className="text-sm font-semibold">Add Banner</p>
    </button>
  );
}

export default function HeroBannerGrid({
  banners,
  maxBanners = 7,
  onSourceChange,
  onReplace,
  onDelete,
  onAddBanner,
}: HeroBannerGridProps) {
  const canAddMore = banners.length < maxBanners;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {banners.map((banner, index) => (
        <BannerCard
          key={banner.id}
          banner={banner}
          index={index}
          onSourceChange={(value) => onSourceChange(banner.id, value)}
          onReplace={(file) => onReplace(banner.id, file)}
          onDelete={() => onDelete(banner.id)}
        />
      ))}

      {canAddMore && <AddBannerCard onAddBanner={onAddBanner} />}
    </div>
  );
}

const DEMO_BANNER_IMAGE_COUNT = 4;

const demoSeedImages = Array.from({ length: DEMO_BANNER_IMAGE_COUNT }, (_, index) =>
  `https://picsum.photos/seed/hero-banner-${index + 1}/1280/720`,
);

export function HeroBannerGridDemo() {
  const [banners, setBanners] = useState<HeroBanner[]>(() =>
    Array.from({ length: 7 }, (_, index) => ({
      id: `banner-${index + 1}`,
      imageSrc: demoSeedImages[index] ?? "",
      source: demoSeedImages[index] ?? "",
    })),
  );

  const handleSourceChange = (bannerId: string, value: string) => {
    setBanners((prev) =>
      prev.map((banner) =>
        banner.id === bannerId
          ? {
              ...banner,
              source: value,
              imageSrc: value,
            }
          : banner,
      ),
    );
  };

  const handleReplace = (bannerId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const nextImage = reader.result;
      if (typeof nextImage !== "string") return;
      setBanners((prev) =>
        prev.map((banner) =>
          banner.id === bannerId
            ? {
                ...banner,
                source: nextImage,
                imageSrc: nextImage,
              }
            : banner,
        ),
      );
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (bannerId: string) => {
    setBanners((prev) =>
      prev.map((banner) =>
        banner.id === bannerId
          ? {
              ...banner,
              source: "",
              imageSrc: "",
            }
          : banner,
      ),
    );
  };

  const handleAddBanner = () => {
    setBanners((prev) => {
      if (prev.length >= 7) return prev;
      const nextBannerNumber = prev.length + 1;
      return [
        ...prev,
        {
          id: `banner-${nextBannerNumber}`,
          source: "",
          imageSrc: "",
        },
      ];
    });
  };

  return (
    <HeroBannerGrid
      banners={banners}
      onSourceChange={handleSourceChange}
      onReplace={handleReplace}
      onDelete={handleDelete}
      onAddBanner={handleAddBanner}
    />
  );
}
