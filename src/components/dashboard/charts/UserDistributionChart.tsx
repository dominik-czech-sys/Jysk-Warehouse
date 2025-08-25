import React, { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const fetchUserDistribution = async () => {
  // This should be a call to an RPC function for security in a real app
  const { data, error } = await supabase.from("profiles").select("store_id");
  if (error) throw new Error(error.message);
  return data;
};

export const UserDistributionChart: React.FC = () => {
  const { t } = useTranslation();
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["userDistribution"],
    queryFn: fetchUserDistribution,
  });

  const chartData = useMemo(() => {
    if (!profiles) return [];
    const counts = profiles.reduce((acc, { store_id }) => {
      const key = store_id || t("common.unknown");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, users]) => ({ name, users }));
  }, [profiles, t]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("common.usersPerStore")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {isLoading ? (
            <div>{t("common.loadingUsers")}...</div>
          ) : (
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name={t("common.users")} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};