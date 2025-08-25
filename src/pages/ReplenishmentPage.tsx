import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useArticles, Article } from "@/data/articles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const ReplenishmentPage = () => {
  const { t } = useTranslation();
  const { articles } = useArticles();

  const articlesToReplenish = useMemo(() => {
    // First, filter to only include actual store articles, which have replenishment properties.
    // This also acts as a type guard for TypeScript.
    const storeArticles = articles.filter(
      (article): article is Article => article.storeId !== "GLOBAL"
    );

    // Now, from the store articles, find the ones that need replenishment.
    return storeArticles.filter(
      (article) =>
        article.hasShopFloorStock &&
        article.shopFloorStock !== undefined &&
        article.replenishmentTrigger !== undefined &&
        article.shopFloorStock < article.replenishmentTrigger
    );
  }, [articles]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">{t("common.replenishment")}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("common.replenishmentList")}</CardTitle>
          <CardDescription>{t("common.replenishmentListDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.articleId")}</TableHead>
                <TableHead>{t("common.articleName")}</TableHead>
                <TableHead>{t("common.warehouseLocation")}</TableHead>
                <TableHead>{t("common.shopFloorStock")}</TableHead>
                <TableHead>{t("common.replenishmentTrigger")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articlesToReplenish.length > 0 ? (
                articlesToReplenish.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.id}</TableCell>
                    <TableCell>{article.name}</TableCell>
                    <TableCell>{`${article.rackId} - ${t("common.shelf")} ${article.shelfNumber}`}</TableCell>
                    <TableCell>{article.shopFloorStock}</TableCell>
                    <TableCell>{article.replenishmentTrigger}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {t("common.noArticlesToReplenish")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReplenishmentPage;