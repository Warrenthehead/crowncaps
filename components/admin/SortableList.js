'use client';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGrip } from '@/components/icons';

// Liste réordonnable par glisser-déposer (souris, doigt et clavier).
// items : tableau d'objets avec un "id" ; onChange reçoit le nouveau tableau.
// renderItem(item, handle) : "handle" est la poignée à placer dans la ligne.
export default function SortableList({ items, onChange, renderItem, layout = 'list', className = '' }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    onChange(arrayMove(items, from, to));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}>
        <div className={className}>
          {items.map((item, index) => (
            <SortableItem key={item.id} id={item.id}>
              {(handle) => renderItem(item, handle, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };
  const handle = (
    <button
      type="button"
      className="flex h-10 w-8 shrink-0 cursor-grab touch-none items-center justify-center text-muted hover:text-ink active:cursor-grabbing"
      aria-label="Glisser pour déplacer"
      {...attributes}
      {...listeners}
    >
      <IconGrip size={18} />
    </button>
  );
  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'relative shadow-lg' : 'relative'}>
      {children(handle)}
    </div>
  );
}
