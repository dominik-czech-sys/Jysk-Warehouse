import React, { useMemo } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { useTasks, Task } from "@/data/tasks";
import { KanbanColumn } from "./KanbanColumn";
import { useTranslation } from "react-i18next";

export const KanbanBoard: React.FC = () => {
  const { t } = useTranslation();
  const { tasks, updateTask } = useTasks();

  const columns = useMemo(() => {
    const newTasks = tasks.filter(t => t.status === 'new');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const completedTasks = tasks.filter(t => t.status === 'completed');
    return {
      new: newTasks,
      in_progress: inProgressTasks,
      completed: completedTasks,
    };
  }, [tasks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeTask = tasks.find(t => t.id === active.id);
      const newStatus = over.id as Task['status'];

      if (activeTask && activeTask.status !== newStatus) {
        updateTask({ ...activeTask, status: newStatus });
      }
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col md:flex-row gap-4">
        <KanbanColumn id="new" title={t('common.task.statusNew')} tasks={columns.new} />
        <KanbanColumn id="in_progress" title={t('common.task.statusInProgress')} tasks={columns.in_progress} />
        <KanbanColumn id="completed" title={t('common.task.statusCompleted')} tasks={columns.completed} />
      </div>
    </DndContext>
  );
};