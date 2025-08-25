import React from "react";
import { useArticles } from "@/data/articles";
import { Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DashboardWidget } from "@/components/DashboardWidget";

interface ArticleOverviewWidgetProps {
  id: string;
}

export const ArticleOverviewWidget: React.FC<ArticleOverviewWidgetProps> = ({ id }) => {
  const { articles } = useArticles();
  const { t } = useTranslation();

  const totalArticles = articles.filter(article => article.storeId !== "GLOBAL").length;
  const totalGlobalArticles = articles.filter(article => article.storeId === "GLOBAL").length;

  return (
    <DashboardWidget id={id} title="common.articleOverview">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold">{totalArticles}</div>
        <Package className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{t("common.totalStoreArticles")}</p>
      <div className="flex items-center justify-between mt-2">
        <div className="text-lg font-semibold">{totalGlobalArticles}</div>
        <span className="text-xs text-muted-foreground">{t("common.totalGlobalArticles")}</span>
      </div>
    </DashboardWidget>
  );
};