import heroImage from "@/assets/images/event.svg";
import highlightImage from "@/assets/images/wheel.svg";
import bowlingImage from "@/assets/images/bowling.svg";
import waterImage from "@/assets/images/aqua.svg";
import { useNavigate } from "react-router-dom";
import ImageWithSkeleton from "@/components/shared/ImageWithSkeleton";
import { motion } from "framer-motion";
import { Star, Flame, MapPin } from "lucide-react";

export default function Addvertise() {
  const navigate = useNavigate();
  return (
    <section className="mt-10">
      <div className="mx-auto max-w-387.5">
        {/* SECTION HEADING */}
        <div className="mx-auto mb-10 w-full max-w-3xl text-center">
          <h2 className="relative inline-block text-start text-[28px] sm:text-3xl lg:text-3xl font-bold text-gray-900 tracking-wide">
            Exclusive Weekend Indulgences
            <span className="absolute left-0 -bottom-2 w-40 h-1 bg-pink-500 rounded-full"></span>
          </h2>
        </div>

        {/* MAIN GRID */}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* LEFT BIG CARD */}
          <article className="relative min-h-[520px] overflow-hidden  bg-gradient-to-br from-[#f8f9fb] via-[#eef1f6] to-[#e3e7ee] shadow-xl px-12 py-16 flex items-center">
            {/* Decorative Background Circle */}
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-pink-200/40 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-40 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl"></div>

            {/* Content */}
            <div className="relative z-10 max-w-lg">
              {/* Badge */}
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-block bg-yellow-400 text-black text-xs font-bold px-4 py-1 rounded-full tracking-wider shadow-sm"
              >
                LIMITED WEEKEND SLOTS
              </motion.span>

              {/* Heading */}
              <motion.h4
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mt-4 text-[38px] leading-tight font-bold text-slate-900"
              >
                Make This Weekend
                <span className="block bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Unforgettable
                </span>
              </motion.h4>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mt-4 text-[16px] text-slate-600"
              >
                Discover top-rated experiences for couples, families & friends —
                handpicked and trending near you.
              </motion.p>

              {/* Feature Points */}
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

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => navigate("/marketplace")}
                className="mt-8 h-12 px-8 rounded-full bg-slate-900 text-white text-[15px] font-semibold tracking-wide shadow-lg hover:bg-black transition"
              >
                Explore Experiences →
              </motion.button>
            </div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute left-105 bottom-0"
            >
              <ImageWithSkeleton
                src={heroImage}
                alt="Weekend activity"
                containerClassName="w-[420px] h-[460px]"
                className="w-full h-full object-contain drop-shadow-2xl"
                loading="lazy"
                decoding="async"
              />
            </motion.div>
          </article>

          {/* RIGHT COLUMN */}
          <div className="grid gap-5">
            {/* HIGHLIGHT CARD */}
            <article className="relative min-h-67.5 overflow-hidden  bg-black p-6 text-white">
              <span className="inline-flex rounded-lg bg-white/10 px-3 py-1 text-[12px] uppercase tracking-widest">
                Weekend Highlight
              </span>

              <div className="relative z-10 mt-4 max-w-[60%]">
                <h4 className="text-[22px] font-semibold">
                  Adventure Activities
                </h4>
                <p className="mt-2 text-[13px] text-white/80">
                  Go-karting, trampoline parks, indoor climbing.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/marketplace")}
                  className="mt-4 h-9 w-30 rounded-full bg-white text-[14px] font-medium text-black transition hover:bg-slate-100"
                >
                  Explore
                </button>
              </div>

              <ImageWithSkeleton
                src={highlightImage}
                alt="Adventure"
                containerClassName="absolute right-0 top-0 h-full w-[45%]"
                className="absolute right-0 top-0 h-full w-[100%] object-contain"
                loading="lazy"
                decoding="async"
              />
            </article>

            {/* SMALL CARDS */}
            <div className="grid gap-5 sm:grid-cols-2">
              {/* BOWLING */}
              <article
                className="relative min-h-65 overflow-hidden  bg-cover bg-center p-6 text-white"
                style={{ backgroundImage: `url(${bowlingImage})` }}
              >
                <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[12px] uppercase tracking-widest">
                  Popular
                </span>

                <div className="absolute bottom-6 left-6">
                  <h4 className="text-[22px] font-semibold">
                    Bowling & Arcade
                  </h4>
                  <p className="mt-1 text-[13px] text-white/90">
                    Bowling · Arcade · VR
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/marketplace")}
                    className="mt-3 h-9 w-30 rounded-full bg-white text-[14px] text-black transition hover:bg-slate-100"
                  >
                    Explore
                  </button>
                </div>
              </article>

              {/* WATER PARK */}
              <article
                className="relative min-h-65 overflow-hidden  bg-cover bg-center p-6 text-white"
                style={{ backgroundImage: `url(${waterImage})` }}
              >
                <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[12px] uppercase tracking-widest">
                  Popular
                </span>

                <div className="absolute bottom-6 left-6">
                  <h4 className="text-[22px] font-semibold">
                    Water Parks & Rides
                  </h4>
                  <p className="mt-1 text-[13px] text-white/90">
                    Slides · Wave pools · Kids zones
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/marketplace")}
                    className="mt-3 h-9 w-30 rounded-full bg-white text-[14px] text-black transition hover:bg-slate-100"
                  >
                    Explore
                  </button>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
