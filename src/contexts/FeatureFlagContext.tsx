import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  is_enabled: boolean;
}

interface FeatureFlagContextType {
  featureFlags: FeatureFlag[];
  isFeatureEnabled: (featureId: string) => boolean;
  toggleFeature: (featureId: string, isEnabled: boolean) => void;
  isLoading: boolean;
}

export const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

const fetchFeatureFlags = async (): Promise<FeatureFlag[]> => {
  const { data, error } = await supabase.from("feature_flags").select("*");
  if (error) throw new Error(error.message);
  return data;
};

export const FeatureFlagProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: featureFlags = [], isLoading } = useQuery<FeatureFlag[]>({
    queryKey: ["featureFlags"],
    queryFn: fetchFeatureFlags,
    enabled: !!user, // Only fetch when user is logged in
  });

  const updateFeatureMutation = useMutation({
    mutationFn: async ({ featureId, isEnabled }: { featureId: string; isEnabled: boolean }) => {
      const { error } = await supabase
        .from("feature_flags")
        .update({ is_enabled: isEnabled })
        .eq("id", featureId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureFlags"] });
      toast.success(t("notification.success.itemSaved"));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const isFeatureEnabled = (featureId: string): boolean => {
    const flag = featureFlags.find(f => f.id === featureId);
    return flag ? flag.is_enabled : false;
  };

  const toggleFeature = (featureId: string, isEnabled: boolean) => {
    updateFeatureMutation.mutate({ featureId, isEnabled });
  };

  return (
    <FeatureFlagContext.Provider value={{ featureFlags, isFeatureEnabled, toggleFeature, isLoading }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error("useFeatureFlags must be used within a FeatureFlagProvider");
  }
  return context;
};