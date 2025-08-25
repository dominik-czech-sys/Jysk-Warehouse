import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Article, useArticles } from "@/data/articles";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface ReplenishmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
}

export const ReplenishmentDialog: React.FC<ReplenishmentDialogProps> = ({ isOpen, onClose, article }) => {
  const { t } = useTranslation();
  const { updateArticle } = useArticles();
  const [quantityToMove, setQuantityToMove] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setQuantityToMove(1);
    }
  }, [isOpen]);

  if (!article) return null;

  const handleReplenish = async () => {
    if (quantityToMove <= 0) {
      toast.error(t("common.replenishment.quantityMustBePositive"));
      return;
    }
    if (quantityToMove > article.quantity) {
      toast.error(t("common.replenishment.notEnoughStock", { available: article.quantity }));
      return;
    }

    const updatedArticle: Article = {
      ...article,
      quantity: article.quantity - quantityToMove,
      shop_floor_stock: (article.shop_floor_stock || 0) + quantityToMove,
    };

    await updateArticle(updatedArticle);
    toast.success(t("common.replenishment.success", { quantity: quantityToMove, articleId: article.article_number }));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("common.replenishment.dialogTitle", { articleId: article.article_number })}</DialogTitle>
          <DialogDescription>{t("common.replenishment.dialogDescription")}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <p>{t("common.articleName")}: <strong>{article.name}</strong></p>
            <p>{t("common.replenishment.warehouseStock")}: <strong>{article.quantity}</strong></p>
            <p>{t("common.shopFloorStock")}: <strong>{article.shop_floor_stock}</strong></p>
          </div>
          <div>
            <Label htmlFor="quantityToMove">{t("common.replenishment.quantityToMove")}</Label>
            <Input
              id="quantityToMove"
              type="number"
              value={quantityToMove}
              onChange={(e) => setQuantityToMove(parseInt(e.target.value, 10) || 1)}
              min="1"
              max={article.quantity}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleReplenish}>{t("common.replenishment.confirm")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};