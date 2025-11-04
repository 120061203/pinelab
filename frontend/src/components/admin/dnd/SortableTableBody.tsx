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

// 保留 Context 以向後兼容（如果其他頁面需要使用）
interface SortableContextValue {
  listeners: any;
  attributes: any;
}

const SortableListenersContext = createContext<SortableContextValue | null>(null);

interface SortableTableRowProps {
  id: string | number;
  renderContent: (listeners: any, attributes: any) => React.ReactNode;
}

function SortableTableRow({ id, renderContent }: SortableTableRowProps) {
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

  // 只保留必要的 attributes（如 role, tabIndex），不包含拖動相關的事件監聽器和樣式
  const rowAttributes: any = {};
  if (attributes.role) rowAttributes.role = attributes.role;
  if (attributes.tabIndex !== undefined) rowAttributes.tabIndex = attributes.tabIndex;
  
  // 確保 row 有默認游標，但子元素可以覆蓋
  const rowStyle: React.CSSProperties = {
    ...style,
    cursor: 'default',
  };

  return (
    <tr 
      ref={setNodeRef} 
      style={rowStyle} 
      {...rowAttributes}
      onMouseMove={(e) => {
        // 確保只有拖動手柄可以改變游標
        const target = e.target as HTMLElement;
        if (!target.closest('[data-drag-handle]')) {
          (e.currentTarget as HTMLElement).style.cursor = 'default';
        }
      }}
    >
      {renderContent(listeners, attributes)}
    </tr>
  );
}

// Hook 來獲取當前行的 listeners 和 attributes
export function useSortableRowListeners() {
  const context = useContext(SortableListenersContext);
  if (!context) {
    console.warn('useSortableRowListeners must be used within SortableTableRow');
    return { listeners: null, attributes: null };
  }
  return context;
}

interface SortableTableBodyProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  getItemId: (item: T) => string | number;
  renderItem: (item: T, index: number, dragHandleProps?: { listeners: any; attributes: any }) => React.ReactNode;
}

export default function SortableTableBody<T>({
  items,
  onReorder,
  getItemId,
  renderItem,
}: SortableTableBodyProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // 需要按住才能拖動，避免意外觸發
      activationConstraint: {
        distance: 8,
      },
    }),
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
          {items.map((item, index) => {
            const itemId = getItemId(item);
            return (
              <SortableTableRow 
                key={itemId} 
                id={itemId}
                renderContent={(listeners, attributes) => renderItem(item, index, { listeners, attributes })}
              />
            );
          })}
        </SortableContext>
      </DndContext>
    </tbody>
  );
}

