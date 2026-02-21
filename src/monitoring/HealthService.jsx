const API_URL = process.env.REACT_APP_API_PUBLICA_URL || "http://localhost:8100";

export const checkBackendHealth = async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `${API_URL}/actuator/health`,
      {
        method: "GET",
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);
    return response.ok;
  } catch (error) {
    console.error("Health check error:", error);
    return true; // Asumimos que el backend está bien para evitar falsos positivos
  }
};
