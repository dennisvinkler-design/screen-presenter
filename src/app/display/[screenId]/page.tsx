'use client';

import { useParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { AlertTriangle, ImageOff } from 'lucide-react';

interface Slide {
  images: [string, string, string];
}

interface PresentationData {
  slides: Slide[];
  currentSlideIndex: number;
}

export default function DisplayPage() {
  const params = useParams();
  const screenId = params?.screenId as string;
  const screenIndex = screenId ? parseInt(screenId, 10) - 1 : -1;
  
  const [presentationState, setPresentationState] = useState<PresentationData | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const pollingIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const response = await fetch('/api/presentation/state');
        if (response.ok) {
          const { data } = await response.json();
          setPresentationState(data);
          setConnectionError(prevError => prevError ? null : prevError); // Clear error on successful fetch
        } else {
          const errorText = `Waiting for presenter... (Status: ${response.status})`;
          setConnectionError(prevError => prevError !== errorText ? errorText : prevError);
        }
      } catch (err) {
        const errorText = 'Connection to server lost. Retrying...';
        setConnectionError(prevError => prevError !== errorText ? errorText : prevError);
        console.error('Polling failed:', err);
      }
    };

    fetchState(); // Initial fetch
    pollingIntervalRef.current = window.setInterval(fetchState, 500);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const currentSlideIndex = presentationState?.currentSlideIndex ?? -1;
  const currentSlide = presentationState?.slides[currentSlideIndex];
  const imageUrl = currentSlide?.images[screenIndex];

  useEffect(() => {
    if (imageUrl) {
      setImageStatus('loading');
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => setImageStatus('loaded');
      img.onerror = () => setImageStatus('error');
    }
  }, [imageUrl]);

  if (screenIndex < 0 || screenIndex > 2) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-neutral-950 text-neutral-200 text-4xl font-bold">
        Invalid Screen ID
      </div>
    );
  }

  const renderContent = () => {
    if (imageStatus === 'error') {
      return (
        <motion.div
          key="image-error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full h-full flex flex-col items-center justify-center text-red-500/80 text-2xl font-bold"
        >
          <ImageOff className="h-24 w-24 mx-auto mb-4" />
          <p>Image failed to load.</p>
          <p className="text-sm text-neutral-500 mt-2">Please check the image URL in the control panel.</p>
        </motion.div>
      );
    }

    if (imageUrl) {
      return (
        <motion.div
          key={imageUrl}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: imageStatus === 'loaded' ? 1 : 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="w-full h-full"
        >
          <img
            src={imageUrl}
            alt={`Display ${screenIndex + 1}, Slide ${currentSlideIndex + 1}`}
            className="w-full h-full object-contain"
          />
        </motion.div>
      );
    }

    return (
      <motion.div
        key="waiting"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full h-full flex flex-col items-center justify-center text-neutral-500 text-6xl font-bold tracking-widest"
      >
        {connectionError ? (
          <div className="text-center text-2xl text-yellow-500/80">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <p>{connectionError}</p>
          </div>
        ) : (
          "WAITING..."
        )}
      </motion.div>
    );
  };

  return (
    <main className="w-screen h-screen bg-neutral-950 overflow-hidden">
      <AnimatePresence>
        {renderContent()}
      </AnimatePresence>
    </main>
  );
}
