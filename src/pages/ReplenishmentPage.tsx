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
    return articles.filter(
      (article) =>
        article.has_shop_floor_stock &&
        article.shop_floor_stock !== undefined &&
        article.replenishment_trigger !== undefined &&
        article.shop_floor_stock < article.replenishment_trigger
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
          <div className="overflow-x-auto rounded-md border">
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
                      <TableCell className="font-medium">{article.article_number}</TableCell>
                      <TableCell>{article.name}</TableCell>
                      <TableCell>{`${article.rack_id} - ${t("common.shelf")} ${article.shelf_number}`}</TableCell>
                      <TableCell>{article.shop_floor_stock}</TableCell>
                      <TableCell>{article.replenishment_trigger}</TableCell>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReplenishmentPage;