import { useEffect } from "react";
import { checkBackendHealth } from "./HealthService";
import { useSystemStatus } from "../context/SystemStatusContext";

export const useBackendMonitor = () => {
  const { setBackendUp } = useSystemStatus();

  useEffect(() => {
    const interval = setInterval(async () => {
      const healthy = await checkBackendHealth();
      setBackendUp(healthy);
    }, 15000);

    return () => clearInterval(interval);
  }, []);
};
