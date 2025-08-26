import React, { useMemo } from "react";
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from "recharts";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTasks } from "@/data/tasks";

const COLORS = ["#0088FE", "#FFBB28", "#00C49F"];

export const TaskStatusChart: React.FC = () => {
  const { t } = useTranslation();
  const { tasks, isLoading } = useTasks();

  const chartData = useMemo(() => {
    if (!tasks) return [];
    const statusCounts = tasks.reduce((acc, task) => {
      const statusKey = `task.status${task.status.charAt(0).toUpperCase() + task.status.slice(1)}`;
      const statusName = t(statusKey);
      acc[statusName] = (acc[statusName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [tasks, t]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.taskStatusDistribution")}</CardTitle>
        <CardDescription>{t("admin.taskStatusDistributionDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {isLoading ? (
            <div>{t("common.loading")}...</div>
          ) : (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};