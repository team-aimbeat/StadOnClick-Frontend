import { useEffect, useState } from "react";

import { formatDealCountdown } from "@/utils/deals";

type DealTimerProps = {
  endTime?: string | null;
  onExpire?: () => void;
  className?: string;
};

export function DealTimer({ endTime, onExpire, className }: DealTimerProps) {
  const [remaining, setRemaining] = useState(() => formatDealCountdown(endTime));

  useEffect(() => {
    setRemaining(formatDealCountdown(endTime));
    if (!endTime) return;

    const interval = window.setInterval(() => {
      const next = formatDealCountdown(endTime);
      setRemaining(next);
      if (!next) {
        window.clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [endTime, onExpire]);

  if (!remaining) return null;

  return <p className={className}>Ends in: {remaining}</p>;
}
