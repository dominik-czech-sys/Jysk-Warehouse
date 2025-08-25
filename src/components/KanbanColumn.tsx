import React from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Task } from "@/data/tasks";
import { TaskCard } from "./TaskCard";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, tasks }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col w-full md:w-1/3 bg-muted/50 rounded-lg p-2">
      <h3 className="font-semibold p-2 mb-2">{title} ({tasks.length})</h3>
      <div ref={setNodeRef} className="flex-grow min-h-[200px] p-2 rounded-md bg-background/50">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};