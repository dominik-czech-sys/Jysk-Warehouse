import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Layers, Info } from "lucide-react";
import { Article } from "@/data/articles";
import { useShelfRacks } from "@/data/shelfRacks";
import { useTranslation } from "react-i18next";

interface WarehouseLocationDisplayProps {
  article: Article | null;
}

export const WarehouseLocationDisplay: React.FC<WarehouseLocationDisplayProps> = ({ article }) => {
  const { shelfRacks } = useShelfRacks();
  const { t } = useTranslation();

  const getShelfRackById = (rackId: string | undefined) => {
    if (!rackId) return null;
    return shelfRacks.find(r => r.id === rackId);
  };

  if (!article) {
    return (
      <Card className="w-full max-w-sm text-center p-4 sm:p-6">
        <CardContent>
          <p className="text-muted-foreground text-sm sm:text-base">{t("common.viewArticleLocation")}</p>
        </CardContent>
      </Card>
    );
  }

  const rack = getShelfRackById(article.rack_id);
  const shelfDescription = rack?.shelves.find(s => s.shelfNumber === article.shelf_number)?.description;

  return (
    <Card className="w-full max-w-sm p-4 sm:p-6">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-xl sm:text-2xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light">{t("common.article")}: {article.article_number}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-center space-x-2 sm:space-x-3 text-base sm:text-lg">
          <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-jyskBlue-dark" />
          <span className="font-semibold">{t("common.rackColon")}</span>
          <span className="text-gray-700 dark:text-gray-300">{article.rack_id}</span>
        </div>
        <div className="flex items-center justify-center space-x-2 sm:space-x-3 text-base sm:text-lg">
          <Layers className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
          <span className="font-semibold">{t("common.shelfColon")}</span>
          <span className="text-gray-700 dark:text-gray-300">{article.shelf_number} {shelfDescription ? `(${shelfDescription})` : ''}</span>
        </div>
        <div className="flex items-center justify-center space-x-2 sm:space-x-3 text-base sm:text-lg">
          <Layers className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
          <span className="font-semibold">{t("common.storeColon")}</span>
          <span className="text-gray-700 dark:text-gray-300">{article.store_id}</span>
        </div>
        <div className="flex items-center justify-center space-x-2 sm:space-x-3 text-base sm:text-lg">
          <Info className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
          <span className="font-semibold">{t("common.statusColon")}</span>
          <span className="text-gray-700 dark:text-gray-300">{article.status}</span>
        </div>
      </CardContent>
    </Card>
  );
};