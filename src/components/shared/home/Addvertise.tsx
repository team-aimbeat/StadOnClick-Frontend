import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Flame, MapPin } from "lucide-react";

import heroImage from "@/assets/images/event.svg";
import highlightImage from "@/assets/images/wheel.svg";
import bowlingImage from "@/assets/images/bowling.svg";
import waterImage from "@/assets/images/aqua.svg";
import ImageWithSkeleton from "@/components/shared/ImageWithSkeleton";

type AddvertiseContent = {
  images: string[];
  leftBadge: string;
  leftTitleLine1: string;
  leftTitleLine2: string;
  leftDescription: string;
  leftCta: string;
  highlightBadge: string;
  highlightTitle: string;
  highlightDescription: string;
  highlightCta: string;
  cardOneBadge: string;
  cardOneTitle: string;
  cardOneDescription: string;
  cardOneCta: string;
  cardTwoBadge: string;
  cardTwoTitle: string;
  cardTwoDescription: string;
  cardTwoCta: string;
  featuredBadge: string;
  featuredTitle: string;
  featuredCta: string;
};

type AddvertiseProps = {
  content?: Partial<AddvertiseContent>;
};

const ADVERTISE_IMAGE_COUNT = 5;

const fallbackContent: AddvertiseContent = {
  images: [heroImage, highlightImage, bowlingImage, waterImage, heroImage],
  leftBadge: "LIMITED WEEKEND SLOTS",
  leftTitleLine1: "Make This Weekend",
  leftTitleLine2: "Unforgettable",
  leftDescription:
    "Discover top-rated experiences for couples, families and friends, handpicked and trending near you.",
  leftCta: "Explore Experiences ->",
  highlightBadge: "Weekend Highlight",
  highlightTitle: "Adventure Activities",
  highlightDescription: "Go-karting, trampoline parks, indoor climbing.",
  highlightCta: "Explore",
  cardOneBadge: "Popular",
  cardOneTitle: "Bowling & Arcade",
  cardOneDescription: "Bowling · Arcade · VR",
  cardOneCta: "Explore",
  cardTwoBadge: "Popular",
  cardTwoTitle: "Water Parks & Rides",
  cardTwoDescription: "Slides · Wave pools · Kids zones",
  cardTwoCta: "Explore",
  featuredBadge: "Featured",
  featuredTitle: "More Weekend Picks",
  featuredCta: "View",
};

export default function Addvertise({ content }: AddvertiseProps) {
  const navigate = useNavigate();

  const merged = useMemo<AddvertiseContent>(() => {
    const rawImages = Array.isArray(content?.images) ? content.images : [];
    const images = Array.from({ length: ADVERTISE_IMAGE_COUNT }, (_, index) => {
      const value = String(rawImages[index] ?? "").trim();
      return value || fallbackContent.images[index];
    });

    return {
      ...fallbackContent,
      ...content,
      images,
    };
  }, [content]);

  return (
    <section className="mt-10">
      <div className="mx-auto max-w-387.5">
        <div className="mx-auto mb-10 w-full max-w-3xl text-center">
          <h2 className="relative inline-block text-start text-[28px] font-bold tracking-wide text-gray-900 sm:text-3xl lg:text-3xl">
            Exclusive Weekend Indulgences
            <span className="absolute -bottom-2 left-0 h-1 w-40 rounded-full bg-pink-500"></span>
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="relative flex min-h-[520px] items-center overflow-hidden bg-gradient-to-br from-[#f8f9fb] via-[#eef1f6] to-[#e3e7ee] px-12 py-16 shadow-xl">
            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-pink-200/40 blur-3xl"></div>
            <div className="absolute bottom-0 right-40 h-80 w-80 rounded-full bg-purple-200/40 blur-3xl"></div>

            <div className="relative z-10 max-w-lg">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-block rounded-full bg-yellow-400 px-4 py-1 text-xs font-bold tracking-wider text-black shadow-sm"
              >
                {merged.leftBadge}
              </motion.span>

              <motion.h4
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mt-4 text-[38px] font-bold leading-tight text-slate-900"
              >
                {merged.leftTitleLine1}
                <span className="block bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  {merged.leftTitleLine2}
                </span>
              </motion.h4>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mt-4 text-[16px] text-slate-600"
              >
                {merged.leftDescription}
              </motion.p>

              <div className="mt-6 flex gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Star size={16} />
                  4.8 Rated
                </div>
                <div className="flex items-center gap-2">
                  <Flame size={16} />
                  Trending
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  Nearby
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => navigate("/marketplace")}
                className="mt-8 h-12 rounded-full bg-slate-900 px-8 text-[15px] font-semibold tracking-wide text-white shadow-lg transition hover:bg-black"
              >
                {merged.leftCta}
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute bottom-0 left-105"
            >
              <ImageWithSkeleton
                src={merged.images[0]}
                alt="Weekend activity"
                containerClassName="w-[420px] h-[460px]"
                className="h-full w-full object-contain drop-shadow-2xl"
                loading="lazy"
                decoding="async"
              />
            </motion.div>
          </article>

          <div className="grid gap-5">
            <article className="relative min-h-67.5 overflow-hidden bg-black p-6 text-white">
              <span className="inline-flex rounded-lg bg-white/10 px-3 py-1 text-[12px] uppercase tracking-widest">
                {merged.highlightBadge}
              </span>
              <div className="relative z-10 mt-4 max-w-[60%]">
                <h4 className="text-[22px] font-semibold">{merged.highlightTitle}</h4>
                <p className="mt-2 text-[13px] text-white/80">{merged.highlightDescription}</p>
                <button
                  type="button"
                  onClick={() => navigate("/marketplace")}
                  className="mt-4 h-9 w-30 rounded-full bg-white text-[14px] font-medium text-black transition hover:bg-slate-100"
                >
                  {merged.highlightCta}
                </button>
              </div>
              <ImageWithSkeleton
                src={merged.images[1]}
                alt="Adventure"
                containerClassName="absolute right-0 top-0 h-full w-[45%]"
                className="absolute right-0 top-0 h-full w-[100%] object-contain"
                loading="lazy"
                decoding="async"
              />
            </article>

            <div className="grid gap-5 sm:grid-cols-2">
              <article
                className="relative min-h-65 overflow-hidden bg-cover bg-center p-6 text-white"
                style={{ backgroundImage: `url(${merged.images[2]})` }}
              >
                <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[12px] uppercase tracking-widest">
                  {merged.cardOneBadge}
                </span>
                <div className="absolute bottom-6 left-6">
                  <h4 className="text-[22px] font-semibold">{merged.cardOneTitle}</h4>
                  <p className="mt-1 text-[13px] text-white/90">{merged.cardOneDescription}</p>
                  <button
                    type="button"
                    onClick={() => navigate("/marketplace")}
                    className="mt-3 h-9 w-30 rounded-full bg-white text-[14px] text-black transition hover:bg-slate-100"
                  >
                    {merged.cardOneCta}
                  </button>
                </div>
              </article>

              <article
                className="relative min-h-65 overflow-hidden bg-cover bg-center p-6 text-white"
                style={{ backgroundImage: `url(${merged.images[3]})` }}
              >
                <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[12px] uppercase tracking-widest">
                  {merged.cardTwoBadge}
                </span>
                <div className="absolute bottom-6 left-6">
                  <h4 className="text-[22px] font-semibold">{merged.cardTwoTitle}</h4>
                  <p className="mt-1 text-[13px] text-white/90">{merged.cardTwoDescription}</p>
                  <button
                    type="button"
                    onClick={() => navigate("/marketplace")}
                    className="mt-3 h-9 w-30 rounded-full bg-white text-[14px] text-black transition hover:bg-slate-100"
                  >
                    {merged.cardTwoCta}
                  </button>
                </div>
              </article>
            </div>

            <article
              className="relative min-h-35 overflow-hidden rounded-2xl bg-cover bg-center p-6 text-white"
              style={{ backgroundImage: `url(${merged.images[4]})` }}
            >
              <div className="absolute inset-0 bg-black/45" />
              <div className="relative z-10 flex h-full items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/80">{merged.featuredBadge}</p>
                  <h4 className="mt-1 text-xl font-semibold">{merged.featuredTitle}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/marketplace")}
                  className="h-9 rounded-full bg-white px-4 text-sm font-medium text-black transition hover:bg-slate-100"
                >
                  {merged.featuredCta}
                </button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
