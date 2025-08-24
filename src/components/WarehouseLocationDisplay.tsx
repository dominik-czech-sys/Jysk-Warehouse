import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Layers, Info } from "lucide-react"; // Přidáno Info ikona
import { Article } from "@/data/articles";
import { useShelfRacks } from "@/data/shelfRacks";
import { useTranslation } from "react-i18next"; // Import useTranslation

interface WarehouseLocationDisplayProps {
  article: Article | null;
}

export const WarehouseLocationDisplay: React.FC<WarehouseLocationDisplayProps> = ({ article }) => {
  const { getShelfRackById } = useShelfRacks();
  const { t } = useTranslation(); // Initialize useTranslation

  if (!article) {
    return (
      <Card className="w-full max-w-sm text-center p-6">
        <CardContent>
          <p className="text-muted-foreground">{t("common.viewArticleLocation")}</p>
        </CardContent>
      </Card>
    );
  }

  const rack = getShelfRackById(article.rackId);
  const shelfDescription = rack?.shelves.find(s => s.shelfNumber === article.shelfNumber)?.description;

  return (
    <Card className="w-full max-w-sm p-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light">{t("common.article")}: {article.id}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center space-x-3 text-lg">
          <MapPin className="h-6 w-6 text-jyskBlue-dark" />
          <span className="font-semibold">{t("common.rackColon")}</span>
          <span className="text-gray-700 dark:text-gray-300">{article.rackId}</span>
        </div>
        <div className="flex items-center justify-center space-x-3 text-lg">
          <Layers className="h-6 w-6 text-green-500" />
          <span className="font-semibold">{t("common.shelfColon")}</span>
          <span className="text-gray-700 dark:text-gray-300">{article.shelfNumber} {shelfDescription ? `(${shelfDescription})` : ''}</span>
        </div>
        <div className="flex items-center justify-center space-x-3 text-lg">
          <Layers className="h-6 w-6 text-purple-500" />
          <span className="font-semibold">{t("common.storeColon")}</span>
          <span className="text-gray-700 dark:text-gray-300">{article.storeId}</span>
        </div>
        <div className="flex items-center justify-center space-x-3 text-lg">
          <Info className="h-6 w-6 text-blue-500" /> {/* Nová ikona pro status */}
          <span className="font-semibold">{t("common.statusColon")}</span>
          <span className="text-gray-700 dark:text-gray-300">{article.status}</span>
        </div>
      </CardContent>
    </Card>
  );
};