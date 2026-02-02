import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceGalleryProps {
  galleryImages: string[];
  serviceName: string;
}

export const ServiceGallery: React.FC<ServiceGalleryProps> = ({
  galleryImages,
  serviceName,
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
        <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 shadow-sm transition hover:shadow-md">
          <img
            src={mainImages[0]}
            alt={`${serviceName} main`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>

        {/* Right: Stacked Images */}
        <div className="relative flex flex-col gap-4">
          {mainImages.slice(1, 3).map((image, idx) => (
            <div
              key={idx}
              className="group relative h-[275px] w-full overflow-hidden rounded-xl bg-slate-100 shadow-sm transition hover:shadow-md"
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
                <p className="text-sm text-slate-500">{galleryImages.length} photos found</p>
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
