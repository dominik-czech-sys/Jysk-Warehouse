import React from "react";
import { useTranslation } from "react-i18next";
import { DashboardWidget } from "@/components/DashboardWidget";
import { MapPin, Layers, Info } from "lucide-react";
// This widget would need to subscribe to the search results from WarehouseSearchWidget
// via a shared context or state management library.

interface WarehouseLocationDisplayWidgetProps {
  id: string;
}

export const WarehouseLocationDisplayWidget: React.FC<WarehouseLocationDisplayWidgetProps> = ({ id }) => {
  const { t } = useTranslation();
  // Placeholder data
  const article = null; // In a real app, this would come from state

  return (
    <DashboardWidget id={id} title="common.articleLocation">
      {article ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{t("common.rackColon")} {article.rackId}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span>{t("common.shelfColon")} {article.shelfNumber}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span>{t("common.statusColon")} {article.status}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground h-full flex items-center justify-center">
          {t("common.viewArticleLocation")}
        </p>
      )}
    </DashboardWidget>
  );
};