import { useEffect, useMemo, useState } from "react";
import type { HealthReadyResponse } from "@/features/systemHealth/systemHealth.types";

const HEALTH_WS_EVENT = "HEALTH_UPDATE";
const HEALTH_WS_PATH = "/ws/health";

function getHealthWsUrl() {
  const baseUrl = (import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "").trim();
  if (!baseUrl) return null;

  try {
    const url = new URL(baseUrl);
    const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProtocol}//${url.host}${HEALTH_WS_PATH}`;
  } catch {
    return null;
  }
}

export function useHealthSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [latestReady, setLatestReady] = useState<HealthReadyResponse | null>(null);

  const enabled = useMemo(
    () => String(import.meta.env.VITE_HEALTH_WS_ENABLED || "").toLowerCase() === "true",
    []
  );

  useEffect(() => {
    if (!enabled) return;

    const wsUrl = getHealthWsUrl();
    if (!wsUrl) return;

    const socket = new WebSocket(wsUrl);
    let isActive = true;

    socket.onopen = () => {
      if (isActive) setIsConnected(true);
    };

    socket.onerror = () => {
      if (isActive) setIsConnected(false);
    };

    socket.onclose = () => {
      if (isActive) setIsConnected(false);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message?.type === HEALTH_WS_EVENT && message?.payload) {
          setLatestReady(message.payload as HealthReadyResponse);
        }
      } catch {
        // Ignore malformed payloads.
      }
    };

    return () => {
      isActive = false;
      socket.close();
    };
  }, [enabled]);

  return { isConnected, latestReady };
}
