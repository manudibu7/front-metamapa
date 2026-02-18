export const checkBackendHealth = async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      "https://TU_BACKEND.onrender.com/actuator/health",
      {
        method: "GET",
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);
    return response.ok;
  } catch (error) {
    console.error("Health check error:", error);
    return false;
  }
};
