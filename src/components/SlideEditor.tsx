import { useState, useRef, memo } from 'react';
import { usePresentationStore } from '@/store/presentationStore';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { EditSlideDialog } from './EditSlideDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SimpleThumbnail } from './SimpleThumbnail';
interface Slide {
  images: [string, string, string, string];
}
interface SortableSlideItemProps {
  slide: Slide;
  index: number;
  onEdit: (index: number) => void;
}

// Memoized component to prevent unnecessary re-renders
const SortableSlideItem = memo(({ slide, index, onEdit, onDelete }: SortableSlideItemProps & { onDelete: (index: number) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: index });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center gap-4 group">
      <div {...listeners} className="cursor-grab touch-none p-2 text-neutral-500 hover:text-neutral-300">
        <GripVertical />
      </div>
      <Card className="flex-grow bg-neutral-900 border-neutral-800 hover:border-blue-900/50 transition-colors duration-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-mono text-neutral-500 text-lg w-8">{index + 1}</span>
            <div className="grid grid-cols-4 gap-3">
              {slide.images.map((img, imgIndex) => (
                <div
                  key={imgIndex}
                  className="w-24 h-14 rounded-md overflow-hidden bg-neutral-800 border border-transparent"
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
                    if (!url) return;
                    const { updateSlideImages } = usePresentationStore.getState();
                    const newImages = [...slide.images] as [string, string, string, string];
                    newImages[imgIndex] = url;
                    await updateSlideImages(index, newImages);
                  }}
                >
                  <SimpleThumbnail src={img} alt={`Slide ${index + 1} Screen ${imgIndex + 1}`} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
            <Button variant="ghost" size="icon" onClick={() => onEdit(index)}>
              <Pencil className="h-4 w-4 text-neutral-400" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(index)}>
              <Trash2 className="h-4 w-4 text-red-500/80" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}, (prevProps, nextProps) => {
  // Optimized comparison without JSON.stringify
  if (prevProps.index !== nextProps.index) return false;
  
  // Shallow comparison of images array
  const prevImages = prevProps.slide.images;
  const nextImages = nextProps.slide.images;
  
  if (prevImages.length !== nextImages.length) return false;
  
  for (let i = 0; i < prevImages.length; i++) {
    if (prevImages[i] !== nextImages[i]) return false;
  }
  
  return true;
});
export function SlideEditor() {
  const { slides, addSlide, reorderSlides, deleteSlide } = usePresentationStore();
  const [editingSlide, setEditingSlide] = useState<{ slide: Slide; index: number } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; slideIndex: number | null }>({ isOpen: false, slideIndex: null });
  const parentRef = useRef<HTMLDivElement>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Virtualize when there are many slides (>20)
  const shouldVirtualize = slides.length > 20;

  const virtualizer = useVirtualizer({
    count: slides.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimated height of each slide item
    overscan: 5, // Render 5 extra items outside viewport for smooth scrolling
    enabled: shouldVirtualize,
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = active.id as number;
      const newIndex = over.id as number;
      reorderSlides(oldIndex, newIndex);
    }
  }

  const handleEdit = (index: number) => {
    setEditingSlide({ slide: slides[index], index });
  };

  const handleDeleteClick = (index: number) => {
    setDeleteDialog({ isOpen: true, slideIndex: index });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.slideIndex !== null) {
      deleteSlide(deleteDialog.slideIndex);
      setDeleteDialog({ isOpen: false, slideIndex: null });
    }
  };

  return (
    <div className="space-y-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={slides.map((_, i) => i)} strategy={verticalListSortingStrategy}>
          {shouldVirtualize ? (
            <div
              ref={parentRef}
              className="space-y-4 max-h-[600px] overflow-auto pr-2"
              style={{ contain: 'strict' }}
            >
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const index = virtualItem.index;
                  const slide = slides[index];
                  return (
                    <div
                      key={virtualItem.key}
                      data-index={index}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      <SortableSlideItem index={index} slide={slide} onEdit={handleEdit} onDelete={handleDeleteClick} />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {slides.map((slide, index) => (
                <SortableSlideItem key={index} index={index} slide={slide} onEdit={handleEdit} onDelete={handleDeleteClick} />
              ))}
            </div>
          )}
        </SortableContext>
      </DndContext>
      <Button onClick={addSlide} variant="outline" className="w-full border-dashed border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200">
        <Plus className="mr-2 h-4 w-4" /> Add New Slide
      </Button>
      
      {/* Pre-rendered EditSlideDialog for instant opening */}
      <EditSlideDialog
        isOpen={!!editingSlide}
        onOpenChange={(isOpen) => !isOpen && setEditingSlide(null)}
        slide={editingSlide?.slide || null}
        slideIndex={editingSlide?.index || null}
      />
      
      {/* Shared Delete Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(isOpen) => !isOpen && setDeleteDialog({ isOpen: false, slideIndex: null })}>
        <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-neutral-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              This will permanently delete slide {deleteDialog.slideIndex !== null ? deleteDialog.slideIndex + 1 : ''}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700"
              onClick={() => setDeleteDialog({ isOpen: false, slideIndex: null })}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}