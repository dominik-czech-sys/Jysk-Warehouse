import React, { useMemo } from "react";
import { useTasks } from "@/data/tasks";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { DashboardWidget } from "@/components/DashboardWidget";
import { ClipboardList, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

interface MyTasksWidgetProps {
  id: string;
}

export const MyTasksWidget: React.FC<MyTasksWidgetProps> = ({ id }) => {
  const { t } = useTranslation();
  const { tasks } = useTasks();
  const { user } = useAuth();

  const myTasks = useMemo(() => {
    return tasks.filter(task => task.assigned_to_user_id === user?.id && task.status !== 'completed');
  }, [tasks, user]);

  return (
    <DashboardWidget id={id} title="common.widgets.myTasks">
      <div className="flex items-center justify-between mb-2">
        <div className="text-2xl font-bold">{myTasks.length}</div>
        <ClipboardList className="h-6 w-6 text-muted-foreground" />
      </div>
      {myTasks.length > 0 ? (
        <div className="space-y-2">
          <ul className="space-y-1 text-sm">
            {myTasks.slice(0, 3).map(task => (
              <li key={task.id} className="truncate">
                - {task.title}
              </li>
            ))}
          </ul>
          {myTasks.length > 3 && <p className="text-xs text-muted-foreground">...a další {myTasks.length - 3}.</p>}
          <Link to="/ukoly">
            <Button variant="link" className="p-0 h-auto text-xs">{t("common.widgets.viewAllTasks")}</Button>
          </Link>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground h-full flex flex-col items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <p>{t("common.widgets.noOpenTasks")}</p>
        </div>
      )}
    </DashboardWidget>
  );
};