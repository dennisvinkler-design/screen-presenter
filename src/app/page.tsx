'use client';

import { useEffect } from 'react';
import { usePresentationStore } from '@/store/presentationStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Monitor, Loader2, AlertTriangle, Settings, Tv } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { SlideEditor } from '@/components/SlideEditor';
import { ImageWithLoader } from '@/components/ImageWithLoader';
import { PresentationManager } from '@/components/PresentationManager';
import { ImageLibrary } from '@/components/ImageLibrary';

export default function HomePage() {
  const {
    slides,
    currentSlideIndex,
    nextSlide,
    prevSlide,
    goToSlide,
    initializeState,
    isLoading,
    isUpdating,
    error
  } = usePresentationStore();

  useEffect(() => {
    initializeState();
  }, [initializeState]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (event.key === 'ArrowRight') {
        nextSlide();
      } else if (event.key === 'ArrowLeft') {
        prevSlide();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextSlide, prevSlide]);

  const currentSlide = slides[currentSlideIndex];
  const nextSlidePreview = slides[currentSlideIndex + 1];

  const renderSlidePreview = (slide: { images: string[] } | undefined, title: string, loading: boolean) => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-neutral-400 tracking-wider">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? (
          [...Array(4)].map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="aspect-video w-full" />
            </div>
          ))
        ) : slide ? (
          slide.images.map((img, index) => (
            <div key={index} className="space-y-2">
              <p className="text-sm font-medium text-neutral-500">Screen {index + 1}</p>
              <Card className="overflow-hidden aspect-video bg-neutral-900 border-neutral-800 shadow-lg hover:shadow-blue-500/20 transition-shadow duration-300">
                <CardContent className="p-0">
                  <ImageWithLoader src={img} alt={`Screen ${index + 1}`} />
                </CardContent>
              </Card>
            </div>
          ))
        ) : (
          [...Array(4)].map((_, index) => (
            <div key={index} className="space-y-2">
              <p className="text-sm font-medium text-neutral-500">Screen {index + 1}</p>
              <div className="aspect-video bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center">
                <p className="text-neutral-600 text-sm">End of Show</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-neutral-950 text-neutral-200 text-center p-4">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Connection Error</h1>
        <p className="text-neutral-400">{error}</p>
        <Button onClick={() => initializeState()} className="mt-6">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="space-y-24">
          <header className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-neutral-200 to-neutral-500">
              Ensemble Sync
            </h1>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Synchronized Multi-Screen Presenter Control Panel
            </p>
          </header>
          
          <section id="workspace" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-neutral-300">Saved presentations</h3>
                <PresentationManager
                  onLoad={async (id) => {
                    const res = await fetch(`/api/presentations?id=${encodeURIComponent(id)}`);
                    if (res.ok) {
                      const { data } = await res.json();
                      if (data) {
                        initializeState();
                        await fetch('/api/presentation/state', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ slides: data.slides, currentSlideIndex: data.current_slide_index }),
                        });
                        initializeState();
                      }
                    }
                  }}
                  onSaveAs={async (id) => {
                    const payload = { id, slides, currentSlideIndex };
                    await fetch('/api/presentations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                  }}
                  onDelete={async (id) => {
                    await fetch(`/api/presentations?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
                  }}
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-neutral-300">Image library</h3>
                <div className="border border-neutral-800 rounded-md p-3">
                  <ImageLibrary 
                    onSelect={() => { /* picking handled inside dialogs; here it's for quick browse */ }}
                    showToggle={true}
                  />
                </div>
              </div>
            </div>

          </section>

          <section id="presentation-setup" className="space-y-8">
            <div className="flex items-center gap-4">
              <Settings className="h-8 w-8 text-blue-500" />
              <h2 className="text-4xl font-bold tracking-tight">Presentation Setup</h2>
            </div>
            <p className="text-neutral-400">
              Arrange your presentation here. Add, remove, reorder, and edit slides. All changes are saved automatically.
            </p>
            <SlideEditor />
          </section>
          
          <Separator className="bg-neutral-800" />
          
          <section id="live-preview" className="space-y-8">
            <div className="flex items-center gap-4">
              <Tv className="h-8 w-8 text-blue-500" />
              <h2 className="text-4xl font-bold tracking-tight">Live Preview</h2>
            </div>
            <div className="space-y-12">
              {renderSlidePreview(currentSlide, 'Current Slide', isLoading)}
              {renderSlidePreview(nextSlidePreview, 'Next Slide', isLoading)}
            </div>
          </section>
        </div>
      </main>
      
      <section id="live-control" className="bg-neutral-900/80 border-t border-neutral-800 p-6 sticky bottom-0 backdrop-blur-lg shadow-2xl mt-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={prevSlide}
              disabled={currentSlideIndex === 0 || isUpdating || isLoading}
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg bg-neutral-800 border-neutral-700 hover:bg-neutral-700 disabled:opacity-30 transition-all duration-200"
            >
              <ArrowLeft className="mr-2 h-6 w-6" /> Previous
            </Button>
            <Button
              onClick={nextSlide}
              disabled={currentSlideIndex >= slides.length - 1 || isUpdating || isLoading}
              size="lg"
              className="px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-30 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-950"
            >
              {isUpdating ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Next <ArrowRight className="ml-2 h-6 w-6" /></>}
            </Button>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold tracking-wider text-white relative h-9 flex items-center">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={currentSlideIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="inline-block"
                >
                  {isLoading ? '...' : currentSlideIndex + 1}
                </motion.span>
              </AnimatePresence>
              <span className="text-neutral-500 text-2xl"> / {isLoading ? '...' : slides.length}</span>
            </div>
            <p className="text-sm text-neutral-400">CURRENT SLIDE</p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap justify-center max-w-xs">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isUpdating || isLoading}
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-all duration-200",
                  currentSlideIndex === index ? "bg-blue-500 scale-125" : "bg-neutral-700 hover:bg-neutral-600"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
      
      <footer className="text-center py-8 text-neutral-600 text-sm max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 border-t border-neutral-800 pt-8 mt-16">
          <h3 className="text-xl font-bold text-neutral-300">Setup Instructions</h3>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-neutral-400">
            <div className="flex items-center gap-3 p-4 border border-neutral-800 rounded-lg bg-neutral-900">
              <Monitor className="h-6 w-6 text-blue-500"/>
              <span>Screen 1: <code className="bg-neutral-800 text-blue-400 px-2 py-1 rounded">/display/1</code></span>
            </div>
            <div className="flex items-center gap-3 p-4 border border-neutral-800 rounded-lg bg-neutral-900">
              <Monitor className="h-6 w-6 text-blue-500"/>
              <span>Screen 2: <code className="bg-neutral-800 text-blue-400 px-2 py-1 rounded">/display/2</code></span>
            </div>
          <div className="flex items-center gap-3 p-4 border border-neutral-800 rounded-lg bg-neutral-900">
            <Monitor className="h-6 w-6 text-blue-500"/>
            <span>Screen 3: <code className="bg-neutral-800 text-blue-400 px-2 py-1 rounded">/display/3</code></span>
          </div>
          <div className="flex items-center gap-3 p-4 border border-neutral-800 rounded-lg bg-neutral-900">
            <Monitor className="h-6 w-6 text-blue-500"/>
            <span>Screen 4: <code className="bg-neutral-800 text-blue-400 px-2 py-1 rounded">/display/4</code></span>
          </div>
          </div>
          <p className="text-sm text-neutral-500">Open these URLs in fullscreen on their respective displays.</p>
        </div>
        {/* footer note removed */}
      </footer>
    </div>
  );
}
