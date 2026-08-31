import * as React from "react";
import { Star, X } from "lucide-react";

interface ServiceGalleryProps {
  galleryImages: string[];
  serviceName: string;
  categoryLabel?: string;
  ratingLabel?: string;
  reviewText?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
}

export const ServiceGallery: React.FC<ServiceGalleryProps> = ({
  galleryImages,
  serviceName,
  categoryLabel,
  ratingLabel,
  reviewText,
  ctaLabel,
  onCtaClick,
}) => {
  const [showAll, setShowAll] = React.useState(false);

  if (!galleryImages || galleryImages.length === 0) return null;

  // Use up to 3 images for the main grid
  const mainImages = galleryImages.slice(0, 3);
  const hasMore = galleryImages.length > 3;

  return (
    <div className="relative">
      {/* Gallery Grid */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* Left: Main Image */}
        <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-[28px] bg-slate-100 shadow-sm transition hover:shadow-md">
          <img
            src={mainImages[0]}
            alt={`${serviceName} main`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02)_0%,rgba(15,23,42,0.14)_38%,rgba(15,23,42,0.84)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.18)_0%,rgba(15,23,42,0.04)_38%,rgba(15,23,42,0.12)_100%)]" />
          {(categoryLabel || ratingLabel || reviewText || ctaLabel) && (
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
              <div className="min-w-0 space-y-2">
                {categoryLabel ? (
                  <span className="inline-flex rounded-full bg-[#3f66ff] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_8px_20px_rgba(63,102,255,0.35)]">
                    {categoryLabel}
                  </span>
                ) : null}
                <h2 className="max-w-[24rem] truncate text-[28px] font-bold leading-none mb-5 tracking-[-0.03em] text-white sm:text-[40px]">
                  {serviceName}
                </h2>
                {(ratingLabel || reviewText) && (
                  <div className="flex flex-wrap items-center gap-2.5 text-white/85">
                    {ratingLabel ? (
                      <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/12 px-2.5 py-1 backdrop-blur-sm">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full  text-[#f6ca5c]">
                          <Star className="h-5 w-5 fill-current" />
                        </span>
                        <span className="text-5px font-bold">
                          {ratingLabel}
                        </span>
                      </div>
                    ) : null}
                    {reviewText ? (
                      <span className="text-5px font-semibold text-white/75">
                        {reviewText}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              {ctaLabel ? (
                <button
                  type="button"
                  onClick={onCtaClick}
                  className="shrink-0 rounded-xl bg-[#4F7DFF] px-4 py-3 text-xs font-semibold text-white shadow-[0_16px_36px_rgba(79,125,255,0.38)] transition hover:bg-[#3f59ff]"
                >
                  {ctaLabel}
                </button>
              ) : null}
            </div>
          )}
        </div>

        {/* Right: Stacked Images */}
        <div className="relative flex flex-col gap-4">
          {mainImages.slice(1, 3).map((image, idx) => (
            <div
              key={idx}
              className="group relative h-[275px] w-full overflow-hidden rounded-[24px] bg-slate-100 shadow-sm transition hover:shadow-md"
            >
              <img
                src={image}
                alt={`${serviceName} gallery ${idx + 2}`}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
          ))}

          {/* "See all photos" button */}
          {hasMore && (
            <button
              onClick={() => setShowAll(true)}
              className="absolute bottom-4 right-4 z-10 rounded-xl bg-white/90 px-6 py-2.5 text-sm font-bold text-slate-800 shadow-lg backdrop-blur hover:bg-white active:scale-95 transition"
            >
              See all photos
            </button>
          )}
        </div>
      </div>

      {/* Full Gallery Modal */}
      {showAll && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 transition duration-300 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-h-2xl w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">All Photos</h3>
                <p className="text-sm text-slate-500">
                  {galleryImages.length} photos found
                </p>
              </div>
              <button
                onClick={() => setShowAll(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Grid of All Photos */}
            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {galleryImages.map((image, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-50"
                  >
                    <img
                      src={image}
                      alt={`${serviceName} gallery photo ${idx + 1}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
