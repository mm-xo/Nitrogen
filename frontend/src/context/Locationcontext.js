import React, { createContext, useContext, useState } from 'react';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [coordinates, setCoordinates] = useState(null);

  return (
    <LocationContext.Provider value={{ coordinates, setCoordinates }}>
      {children}
    </LocationContext.Provider>
  );
}


export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used inside a <LocationProvider>');
  }
  return context;
}