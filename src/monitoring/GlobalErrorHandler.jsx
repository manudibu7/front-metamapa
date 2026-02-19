export const initGlobalErrorHandler = () => {
  window.addEventListener("error", (event) => {
    console.error("Error global:", event.error);
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("Promesa no manejada:", event.reason);
  });
};
