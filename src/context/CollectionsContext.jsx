import { createContext, useContext, useMemo } from 'react';
import { useCollections } from '../hooks/useCollections';

const CollectionsContext = createContext({ collections: [], isLoading: true });

export const CollectionsProvider = ({ children }) => {
  const { collections, isLoading, error } = useCollections();

  const value = useMemo(
    () => ({ collections, isLoading, error }),
    [collections, isLoading, error]
  );

  return <CollectionsContext.Provider value={value}>{children}</CollectionsContext.Provider>;
};

export const useCollectionsContext = () => useContext(CollectionsContext);
