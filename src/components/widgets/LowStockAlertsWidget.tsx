import React, { useMemo } from "react";
import { useArticles } from "@/data/articles";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DashboardWidget } from "@/components/DashboardWidget";

interface LowStockAlertsWidgetProps {
  id: string;
}

export const LowStockAlertsWidget: React.FC<LowStockAlertsWidgetProps> = ({ id }) => {
  const { articles } = useArticles();
  const { t } = useTranslation();

  const lowStockArticles = useMemo(() => {
    return articles.filter(article =>
      article.minQuantity !== undefined &&
      article.quantity < article.minQuantity &&
      article.storeId !== "GLOBAL" // Exclude global articles from low stock alerts
    );
  }, [articles]);

  return (
    <DashboardWidget id={id} title="common.lowStockAlerts">
      <div className="flex items-center justify-between mb-2">
        <div className="text-2xl font-bold text-red-700 dark:text-red-300">{lowStockArticles.length}</div>
        <AlertCircle className="h-6 w-6 text-red-500" />
      </div>
      {lowStockArticles.length > 0 ? (
        <ScrollArea className="h-[120px] w-full rounded-md border p-2">
          <ul className="space-y-1">
            {lowStockArticles.map((article) => (
              <li key={`${article.id}-${article.storeId}`} className="flex justify-between items-center text-sm text-red-800 dark:text-red-200">
                <span>
                  <strong>{article.id}</strong> ({article.name})
                </span>
                <span className="font-semibold">
                  {article.quantity} / {article.minQuantity}
                </span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      ) : (
        <p className="text-sm text-muted-foreground">{t("common.noLowStockAlerts")}</p>
      )}
    </DashboardWidget>
  );
};