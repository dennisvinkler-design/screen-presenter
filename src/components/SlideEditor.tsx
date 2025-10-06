import { useState } from 'react';
import { usePresentationStore } from '@/store/presentationStore';
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
import { ImageWithLoader } from './ImageWithLoader';
interface Slide {
  images: [string, string, string];
}
interface SortableSlideItemProps {
  slide: Slide;
  index: number;
  onEdit: (index: number) => void;
}
function SortableSlideItem({ slide, index, onEdit }: SortableSlideItemProps) {
  const { deleteSlide } = usePresentationStore();
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
            <div className="grid grid-cols-3 gap-3">
              {slide.images.map((img, imgIndex) => (
                <div key={imgIndex} className="w-24 h-14 rounded-md overflow-hidden bg-neutral-800">
                  <ImageWithLoader src={img} alt={`Slide ${index + 1} Screen ${imgIndex + 1}`} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={() => onEdit(index)}>
              <Pencil className="h-4 w-4 text-neutral-400" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-red-500/80" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-neutral-200">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-neutral-400">
                    This will permanently delete slide {index + 1}. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteSlide(index)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export function SlideEditor() {
  const { slides, addSlide, reorderSlides } = usePresentationStore();
  const [editingSlide, setEditingSlide] = useState<{ slide: Slide; index: number } | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
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
  return (
    <div className="space-y-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={slides.map((_, i) => i)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {slides.map((slide, index) => (
              <SortableSlideItem key={index} index={index} slide={slide} onEdit={handleEdit} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button onClick={addSlide} variant="outline" className="w-full border-dashed border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200">
        <Plus className="mr-2 h-4 w-4" /> Add New Slide
      </Button>
      {editingSlide && (
        <EditSlideDialog
          isOpen={!!editingSlide}
          onOpenChange={(isOpen) => !isOpen && setEditingSlide(null)}
          slide={editingSlide.slide}
          slideIndex={editingSlide.index}
        />
      )}
    </div>
  );
}