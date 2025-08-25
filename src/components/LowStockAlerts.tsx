import React, { useMemo } from "react";
import { useArticles } from "@/data/articles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export const LowStockAlerts: React.FC = () => {
  const { articles } = useArticles();
  const { t } = useTranslation();

  const lowStockArticles = useMemo(() => {
    return articles.filter(article => 
      article.minQuantity !== undefined && 
      article.quantity < article.minQuantity &&
      article.storeId !== "GLOBAL" // Exclude global articles from low stock alerts
    );
  }, [articles]);

  if (lowStockArticles.length === 0) {
    return null;
  }

  return (
    <Card className="w-full max-w-md bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 shadow-md animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold text-red-700 dark:text-red-300 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" /> {t("common.lowStockAlerts")}
        </CardTitle>
        <Badge variant="destructive">{lowStockArticles.length}</Badge>
      </CardHeader>
      <CardContent className="pt-2">
        <p className="text-sm text-red-600 dark:text-red-400 mb-3">{t("common.lowStockMessage")}</p>
        <ScrollArea className="h-[150px] w-full rounded-md border border-red-100 dark:border-red-800 p-2">
          <ul className="space-y-2">
            {lowStockArticles.map((article) => (
              <li key={`${article.id}-${article.storeId}`} className="flex justify-between items-center text-sm text-red-800 dark:text-red-200">
                <span>
                  <strong>{article.id}</strong> ({article.name}) - {t("common.storeId")}: {article.storeId}
                </span>
                <span className="font-semibold">
                  {t("common.current")}: {article.quantity} / {t("common.min")}: {article.minQuantity}
                </span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};