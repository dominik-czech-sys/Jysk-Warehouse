import React, { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCompletedAudits } from "@/data/audits";

export const AuditScoresChart: React.FC = () => {
  const { t } = useTranslation();
  const { audits, isLoading } = useCompletedAudits();

  const chartData = useMemo(() => {
    if (!audits) return [];

    const scoresByStore: Record<string, { totalScore: number; count: number }> = {};

    audits.forEach(audit => {
      if (audit.store_id && audit.score !== null) {
        if (!scoresByStore[audit.store_id]) {
          scoresByStore[audit.store_id] = { totalScore: 0, count: 0 };
        }
        scoresByStore[audit.store_id].totalScore += audit.score;
        scoresByStore[audit.store_id].count++;
      }
    });

    return Object.entries(scoresByStore).map(([storeId, data]) => ({
      name: storeId,
      averageScore: data.totalScore / data.count,
    }));
  }, [audits]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("common.audit.averageScoresByStore")}</CardTitle>
        <CardDescription>{t("common.audit.averageScoresByStoreDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {isLoading ? (
            <div>{t("common.loading")}...</div>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
              <Tooltip formatter={(value) => `${(value as number).toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="averageScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name={t("common.audit.averageScore")} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};