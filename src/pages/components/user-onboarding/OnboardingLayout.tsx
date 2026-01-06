import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import verifiedIcon from "../../../assets/icons/check.svg";
import trustedIcon from "../../../assets/icons/Lock.svg";
import secureIcon from "../../../assets/icons/Star.svg";

type OnboardingLayoutProps = {
  image: string;
  imageTitle: string;
  imageSubtitle: string;
  children: React.ReactNode;
};

export function OnboardingLayout({
  image,
  imageTitle,
  imageSubtitle,
  children,
}: OnboardingLayoutProps) {
  const [bgSrc, setBgSrc] = useState(image);
  const [prevBgSrc, setPrevBgSrc] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [newLoaded, setNewLoaded] = useState(false);

  useEffect(() => {
    if (image !== bgSrc) {
      setPrevBgSrc(bgSrc);
      setBgSrc(image);
      setIsTransitioning(true);
      setNewLoaded(false);
    }
  }, [image, bgSrc]);

  useEffect(() => {
    if (isTransitioning && newLoaded) {
      const timeout = setTimeout(() => {
        setPrevBgSrc(null);
        setIsTransitioning(false);
      }, 650);
      return () => clearTimeout(timeout);
    }
  }, [isTransitioning, newLoaded]);

  const enteringClasses = isTransitioning
    ? newLoaded
      ? "opacity-100"
      : "opacity-0"
    : "opacity-100";

  const exitingClasses = isTransitioning ? "opacity-0" : "opacity-100";

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {prevBgSrc ? (
        <img
          src={prevBgSrc}
          alt=""
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-400 ease-in-out ${exitingClasses}`}
        />
      ) : null}

      <img
        src={bgSrc}
        alt="Onboarding"
        className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-400 ease-in-out ${enteringClasses}`}
        loading="lazy"
        onLoad={() => setNewLoaded(true)}
      />

      <div className="relative z-20 flex min-h-screen items-start px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
        <div className="w-full flex justify-start gap-4 lg:flex-row lg:items-end lg:gap-40">
          <div className="flex justify-center lg:justify-start drop-shadow-lg">
            {children}
          </div>

          <div className="hidden lg:flex flex-col items-center text-center text-white gap-4">
            <h2 className="font-normal drop-shadow-lg hero-script whitespace-pre-line">
              {imageTitle}
            </h2>
            {imageSubtitle ? (
              <p className="text-lg text-white/90 hero-subtitle">
                {imageSubtitle}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Badge
                variant="secondary"
                className="flex items-center gap-2 bg-black/40 px-4 py-2 text-white backdrop-blur"
              >
                <img src={verifiedIcon} alt="Verified" className="h-4 w-4" />
                Verified providers
              </Badge>

              <Badge
                variant="secondary"
                className="flex items-center gap-2 bg-black/40 px-4 py-2 text-white backdrop-blur"
              >
                <img src={trustedIcon} alt="Trusted" className="h-4 w-4" />
                Trusted by locals
              </Badge>

              <Badge
                variant="secondary"
                className="flex items-center gap-2 bg-black/40 px-4 py-2 text-white backdrop-blur"
              >
                <img src={secureIcon} alt="Secure" className="h-4 w-4" />
                Secure signup
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
