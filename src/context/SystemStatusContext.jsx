import React, { createContext, useState, useContext } from "react";

const SystemStatusContext = createContext(null);

export const SystemStatusProvider = ({ children }) => {
  const [backendUp, setBackendUp] = useState(true);
  const [online, setOnline] = useState(navigator.onLine);

  return (
    <SystemStatusContext.Provider
      value={{ backendUp, setBackendUp, online, setOnline }}
    >
      {children}
    </SystemStatusContext.Provider>
  );
};

export const useSystemStatus = () => useContext(SystemStatusContext);
