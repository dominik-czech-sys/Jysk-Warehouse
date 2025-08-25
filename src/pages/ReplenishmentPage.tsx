import React, { useMemo, useState } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { ReplenishmentDialog } from "@/components/ReplenishmentDialog";

const ReplenishmentPage = () => {
  const { t } = useTranslation();
  const { articles } = useArticles();
  const { userStoreId } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const articlesToReplenish = useMemo(() => {
    return articles.filter(
      (article) =>
        article.store_id === userStoreId &&
        article.has_shop_floor_stock &&
        article.shop_floor_stock !== undefined &&
        article.replenishment_trigger !== undefined &&
        article.shop_floor_stock < article.replenishment_trigger
    );
  }, [articles, userStoreId]);

  const handleOpenDialog = (article: Article) => {
    setSelectedArticle(article);
    setIsDialogOpen(true);
  };

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
                  <TableHead className="text-right">{t("common.action")}</TableHead>
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
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => handleOpenDialog(article)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {t("common.replenishment.replenish")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      {t("common.noArticlesToReplenish")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <ReplenishmentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        article={selectedArticle}
      />
    </div>
  );
};

export default ReplenishmentPage;