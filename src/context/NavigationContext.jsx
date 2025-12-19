import { createContext, useState, useContext } from 'react';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  // Estado inicial: 'IRRESTRICTA' o 'CURADA'
  const [modoNavegacion, setModoNavegacion] = useState('IRRESTRICTA');

  const toggleModo = () => {
    setModoNavegacion(prev => prev === 'CURADA' ? 'IRRESTRICTA' : 'CURADA');
  };

  return (
    <NavigationContext.Provider value={{ modoNavegacion, toggleModo }}>
      {children}
    </NavigationContext.Provider>
  );
};

// Hook personalizado para usarlo fácilmente
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation debe usarse dentro de NavigationProvider');
  return context;
};