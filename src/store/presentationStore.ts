import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface Slide {
  images: [string, string, string];
}

interface PresentationState {
  slides: Slide[];
  currentSlideIndex: number;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

interface PresentationActions {
  initializeState: () => Promise<void>;
  nextSlide: () => Promise<void>;
  prevSlide: () => Promise<void>;
  goToSlide: (index: number) => Promise<void>;
  addSlide: () => Promise<void>;
  deleteSlide: (index: number) => Promise<void>;
  updateSlideImages: (index: number, images: [string, string, string]) => Promise<void>;
  reorderSlides: (oldIndex: number, newIndex: number) => Promise<void>;
  setError: (error: string | null) => void;
}

type PresentationStore = PresentationState & PresentationActions;

const initialState: PresentationState = {
  slides: [],
  currentSlideIndex: 0,
  isLoading: true,
  isUpdating: false,
  error: null,
};

export const usePresentationStore = create<PresentationStore>()(
  immer((set, get) => ({
    ...initialState,

    initializeState: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await fetch('/api/presentation/state');
        if (!response.ok) {
          throw new Error(`Failed to fetch presentation state: ${response.status}`);
        }

        const { data } = await response.json();
        set((state) => {
          state.slides = data.slides || [];
          state.currentSlideIndex = data.currentSlideIndex || 0;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to initialize presentation';
          state.isLoading = false;
        });
      }
    },

    nextSlide: async () => {
      const { currentSlideIndex, slides, isUpdating } = get();
      if (currentSlideIndex >= slides.length - 1 || isUpdating) return;

      set((state) => {
        state.isUpdating = true;
        state.error = null;
      });

      try {
        const newIndex = currentSlideIndex + 1;
        const response = await fetch('/api/presentation/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slides,
            currentSlideIndex: newIndex,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update slide: ${response.status}`);
        }

        set((state) => {
          state.currentSlideIndex = newIndex;
          state.isUpdating = false;
        });
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to advance slide';
          state.isUpdating = false;
        });
      }
    },

    prevSlide: async () => {
      const { currentSlideIndex, slides, isUpdating } = get();
      if (currentSlideIndex <= 0 || isUpdating) return;

      set((state) => {
        state.isUpdating = true;
        state.error = null;
      });

      try {
        const newIndex = currentSlideIndex - 1;
        const response = await fetch('/api/presentation/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slides,
            currentSlideIndex: newIndex,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update slide: ${response.status}`);
        }

        set((state) => {
          state.currentSlideIndex = newIndex;
          state.isUpdating = false;
        });
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to go back slide';
          state.isUpdating = false;
        });
      }
    },

    goToSlide: async (index: number) => {
      const { slides, isUpdating } = get();
      if (index < 0 || index >= slides.length || isUpdating) return;

      set((state) => {
        state.isUpdating = true;
        state.error = null;
      });

      try {
        const response = await fetch('/api/presentation/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slides,
            currentSlideIndex: index,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update slide: ${response.status}`);
        }

        set((state) => {
          state.currentSlideIndex = index;
          state.isUpdating = false;
        });
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to go to slide';
          state.isUpdating = false;
        });
      }
    },

    addSlide: async () => {
      const { slides, isUpdating } = get();
      if (isUpdating) return;

      set((state) => {
        state.isUpdating = true;
        state.error = null;
      });

      try {
        const newSlide: Slide = {
          images: ['', '', '']
        };
        const newSlides = [...slides, newSlide];

        const response = await fetch('/api/presentation/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slides: newSlides,
            currentSlideIndex: get().currentSlideIndex,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to add slide: ${response.status}`);
        }

        set((state) => {
          state.slides = newSlides;
          state.isUpdating = false;
        });
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to add slide';
          state.isUpdating = false;
        });
      }
    },

    deleteSlide: async (index: number) => {
      const { slides, currentSlideIndex, isUpdating } = get();
      if (index < 0 || index >= slides.length || isUpdating) return;

      set((state) => {
        state.isUpdating = true;
        state.error = null;
      });

      try {
        const newSlides = slides.filter((_, i) => i !== index);
        let newCurrentIndex = currentSlideIndex;
        
        // Adjust current slide index if necessary
        if (currentSlideIndex >= newSlides.length) {
          newCurrentIndex = Math.max(0, newSlides.length - 1);
        } else if (currentSlideIndex > index) {
          newCurrentIndex = currentSlideIndex - 1;
        }

        const response = await fetch('/api/presentation/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slides: newSlides,
            currentSlideIndex: newCurrentIndex,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to delete slide: ${response.status}`);
        }

        set((state) => {
          state.slides = newSlides;
          state.currentSlideIndex = newCurrentIndex;
          state.isUpdating = false;
        });
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to delete slide';
          state.isUpdating = false;
        });
      }
    },

    updateSlideImages: async (index: number, images: [string, string, string]) => {
      const { slides, isUpdating } = get();
      if (index < 0 || index >= slides.length || isUpdating) return;

      set((state) => {
        state.isUpdating = true;
        state.error = null;
      });

      try {
        const newSlides = [...slides];
        newSlides[index] = { images };

        const response = await fetch('/api/presentation/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slides: newSlides,
            currentSlideIndex: get().currentSlideIndex,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update slide images: ${response.status}`);
        }

        set((state) => {
          state.slides = newSlides;
          state.isUpdating = false;
        });
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to update slide images';
          state.isUpdating = false;
        });
      }
    },

    reorderSlides: async (oldIndex: number, newIndex: number) => {
      const { slides, currentSlideIndex, isUpdating } = get();
      if (oldIndex === newIndex || isUpdating) return;

      set((state) => {
        state.isUpdating = true;
        state.error = null;
      });

      try {
        const newSlides = [...slides];
        const [movedSlide] = newSlides.splice(oldIndex, 1);
        newSlides.splice(newIndex, 0, movedSlide);

        // Adjust current slide index if necessary
        let newCurrentIndex = currentSlideIndex;
        if (currentSlideIndex === oldIndex) {
          newCurrentIndex = newIndex;
        } else if (oldIndex < currentSlideIndex && newIndex >= currentSlideIndex) {
          newCurrentIndex = currentSlideIndex - 1;
        } else if (oldIndex > currentSlideIndex && newIndex <= currentSlideIndex) {
          newCurrentIndex = currentSlideIndex + 1;
        }

        const response = await fetch('/api/presentation/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slides: newSlides,
            currentSlideIndex: newCurrentIndex,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to reorder slides: ${response.status}`);
        }

        set((state) => {
          state.slides = newSlides;
          state.currentSlideIndex = newCurrentIndex;
          state.isUpdating = false;
        });
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to reorder slides';
          state.isUpdating = false;
        });
      }
    },

    setError: (error: string | null) => {
      set((state) => {
        state.error = error;
      });
    },
  }))
);

