import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface UserManagementSectionProps {
  // Props jsou dočasně odstraněny
}

export const UserManagementSection: React.FC<UserManagementSectionProps> = () => {
  const { t } = useTranslation();

  return (
    <div className="mb-6 sm:mb-8 w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("common.userManagement")}</h2>
      </div>
      <Card className="border-dashed border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
            <Construction className="h-5 w-5" />
            Funkce ve Výstavbě
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Správa uživatelů se právě předělává, aby byla bezpečně integrována se Supabase. Tato funkce bude brzy opět k dispozici s vylepšeným zabezpečením.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};