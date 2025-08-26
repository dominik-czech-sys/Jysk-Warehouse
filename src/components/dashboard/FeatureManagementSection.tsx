import React from "react";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export const FeatureManagementSection: React.FC = () => {
  const { t } = useTranslation();
  const { featureFlags, toggleFeature, isLoading } = useFeatureFlags();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("featureFlags.title")}</CardTitle>
        <CardDescription>{t("featureFlags.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
        ) : (
          featureFlags.map(flag => (
            <div key={flag.id} className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor={flag.id} className="text-base">{flag.name}</Label>
                <p className="text-sm text-muted-foreground">{flag.description}</p>
              </div>
              <Switch
                id={flag.id}
                checked={flag.is_enabled}
                onCheckedChange={(checked) => toggleFeature(flag.id, checked)}
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};