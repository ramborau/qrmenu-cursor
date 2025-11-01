"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  sortOrder: number;
  subCategories: any[];
}

interface DraggableCategoryListProps {
  categories: Category[];
  onReorder: (newOrder: Category[]) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onManage: (id: string) => void;
}

function SortableCategoryItem({
  category,
  onEdit,
  onDelete,
  onManage,
}: {
  category: Category;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onManage: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing touch-none"
              >
                <GripVertical className="h-5 w-5 text-gray-400" />
              </button>
              <CardTitle className="flex items-center gap-2">
                {category.icon && <span>{category.icon}</span>}
                {category.name}
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onManage(category.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(category.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          {category.description && (
            <CardDescription>{category.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Sub-categories: {category.subCategories.length}
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onManage(category.id)}
            >
              Manage Category
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DraggableCategoryList({
  categories,
  onReorder,
  onEdit,
  onDelete,
  onManage,
}: DraggableCategoryListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);

      const newOrder = arrayMove(categories, oldIndex, newIndex);

      // Update sortOrder values
      const updatedOrder = newOrder.map((cat, index) => ({
        ...cat,
        sortOrder: index,
      }));

      onReorder(updatedOrder);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={categories.map((cat) => cat.id)}
        strategy={verticalListSortingStrategy}
      >
        {categories.map((category) => (
          <SortableCategoryItem
            key={category.id}
            category={category}
            onEdit={onEdit}
            onDelete={onDelete}
            onManage={onManage}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}

