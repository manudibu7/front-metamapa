import { useEffect } from "react";
import { useSystemStatus } from "../context/SystemStatusContext";

export const useConnectivityMonitor = () => {
  const { setOnline } = useSystemStatus();

  useEffect(() => {
    const updateStatus = () => setOnline(navigator.onLine);

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);
};
