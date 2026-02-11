import { useEffect, useRef, useState, type ComponentProps, type SyntheticEvent } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    if (imageRef.current?.complete) {
      setIsLoaded(true);
    }
  }, [props.src]);

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(event);
  };

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onError?.(event);
  };

  return (
    <div className={cn("relative", containerClassName)}>
      {!isLoaded ? (
        <Skeleton
          className={cn("absolute inset-0 rounded-none bg-slate-200/80", skeletonClassName)}
          aria-hidden="true"
        />
      ) : null}

      <img
        ref={imageRef}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}
