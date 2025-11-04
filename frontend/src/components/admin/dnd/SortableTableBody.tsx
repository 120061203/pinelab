"use client";

import React, { createContext, useContext } from 'react';
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
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Context 來傳遞 listeners
const SortableListenersContext = createContext<any>(null);

interface SortableTableRowProps {
  id: string | number;
  children: React.ReactNode;
}

function SortableTableRow({ id, children }: SortableTableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <SortableListenersContext.Provider value={listeners}>
      <tr ref={setNodeRef} style={style} {...attributes}>
        {children}
      </tr>
    </SortableListenersContext.Provider>
  );
}

// Hook 來獲取當前行的 listeners
export function useSortableRowListeners() {
  return useContext(SortableListenersContext);
}

interface SortableTableBodyProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  getItemId: (item: T) => string | number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export default function SortableTableBody<T>({
  items,
  onReorder,
  getItemId,
  renderItem,
}: SortableTableBodyProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => getItemId(item) === active.id);
      const newIndex = items.findIndex((item) => getItemId(item) === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(newItems);
    }
  };

  return (
    <tbody>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(getItemId)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item, index) => (
            <SortableTableRow key={getItemId(item)} id={getItemId(item)}>
              {renderItem(item, index)}
            </SortableTableRow>
          ))}
        </SortableContext>
      </DndContext>
    </tbody>
  );
}

