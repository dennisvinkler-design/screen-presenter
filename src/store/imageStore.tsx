import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface FileRow {
  name: string;
  url: string;
}

interface ImageStoreState {
  images: FileRow[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

interface ImageStoreContext extends ImageStoreState {
  refreshImages: () => Promise<void>;
  addImage: (image: FileRow) => void;
  removeImage: (name: string) => void;
}

const ImageStoreContext = createContext<ImageStoreContext | null>(null);

export function ImageStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ImageStoreState>({
    images: [],
    isLoading: false,
    error: null,
    lastFetched: null,
  });

  const refreshImages = useCallback(async () => {
    // Don't fetch if we fetched less than 30 seconds ago
    const now = Date.now();
    if (state.lastFetched && now - state.lastFetched < 30000) {
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const res = await fetch('/api/images', { cache: 'no-store' });
      if (res.ok) {
        const { data } = await res.json();
        setState({
          images: data || [],
          isLoading: false,
          error: null,
          lastFetched: now,
        });
      } else {
        throw new Error('Failed to fetch images');
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch images',
      }));
    }
  }, [state.lastFetched]);

  const addImage = useCallback((image: FileRow) => {
    setState((prev) => ({
      ...prev,
      images: [image, ...prev.images],
    }));
  }, []);

  const removeImage = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.name !== name),
    }));
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    refreshImages();
  }, []);

  const value: ImageStoreContext = {
    ...state,
    refreshImages,
    addImage,
    removeImage,
  };

  return (
    <ImageStoreContext.Provider value={value}>
      {children}
    </ImageStoreContext.Provider>
  );
}

export function useImageStore() {
  const context = useContext(ImageStoreContext);
  if (!context) {
    throw new Error('useImageStore must be used within ImageStoreProvider');
  }
  return context;
}

