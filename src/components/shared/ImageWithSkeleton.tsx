import { useEffect, useRef, useState, type ComponentProps, type SyntheticEvent } from "react";
import { cn } from "@/lib/utils";

type ImageWithSkeletonProps = ComponentProps<"img"> & {
  containerClassName?: string;
  skeletonClassName?: string;
};

export default function ImageWithSkeleton({
  className,
  containerClassName,
  skeletonClassName,
  onLoad,
  onError,
  ...props
}: ImageWithSkeletonProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [phase, setPhase] = useState<"loading" | "loaded" | "error">("loading");
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    const element = imageRef.current;
    setPhase("loading");
    setShowSkeleton(true);
    if (!element) return;

    const markLoaded = () => setPhase("loaded");
    const markError = () => setPhase("error");

    if (element.complete) {
      if (element.naturalWidth > 0 || element.naturalHeight > 0) {
        markLoaded();
      } else {
        markError();
      }
      return;
    }

    element.addEventListener("load", markLoaded);
    element.addEventListener("error", markError);

    return () => {
      element.removeEventListener("load", markLoaded);
      element.removeEventListener("error", markError);
    };
  }, [props.src]);

  useEffect(() => {
    if (phase === "loading") return;
    const timeoutId = window.setTimeout(() => setShowSkeleton(false), 320);
    return () => window.clearTimeout(timeoutId);
  }, [phase]);

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    setPhase("loaded");
    onLoad?.(event);
  };

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    setPhase("error");
    onError?.(event);
  };

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {showSkeleton ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out will-change-[opacity]",
            phase === "loaded" ? "opacity-0" : "opacity-100",
            skeletonClassName
          )}
          aria-hidden="true"
        >
          <div className="image-skeleton-surface absolute inset-0" />
          <div className="image-skeleton-detail absolute inset-0" />
          <div className="image-skeleton-shimmer absolute inset-0" />
        </div>
      ) : null}

      <img
        ref={imageRef}
        className={cn(
          "block transition-opacity duration-700 ease-in will-change-[opacity]",
          phase === "loaded" ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}
