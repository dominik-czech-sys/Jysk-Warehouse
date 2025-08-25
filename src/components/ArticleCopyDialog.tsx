import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStores, Store } from "@/data/stores";
import { useArticles } from "@/data/articles";
import { useShelfRacks } from "@/data/shelfRacks";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

interface ArticleCopyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArticleCopyDialog: React.FC<ArticleCopyDialogProps> = ({ isOpen, onClose }) => {
  const { stores } = useStores();
  const { articles, addArticle } = useArticles();
  const { shelfRacks } = useShelfRacks();
  const { user, hasPermission } = useAuth();
  const { t } = useTranslation();

  const [sourceStoreId, setSourceStoreId] = useState<string>("");
  const [targetStoreId, setTargetStoreId] = useState<string>("");
  const [overwriteExisting, setOverwriteExisting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setSourceStoreId("");
      setTargetStoreId("");
      setOverwriteExisting(false);
    }
  }, [isOpen]);

  const handleCopyArticles = () => {
    if (!hasPermission("article:copy_from_store")) {
      toast.error(t("common.noPermissionToCopyArticles"));
      return;
    }
    if (!sourceStoreId || !targetStoreId) {
      toast.error(t("common.fillSourceAndTargetStore"));
      return;
    }
    if (sourceStoreId === targetStoreId) {
      toast.error(t("common.sourceAndTargetCannotBeSame"));
      return;
    }

    const articlesToCopy = articles.filter(article => article.store_id === sourceStoreId);
    if (articlesToCopy.length === 0) {
      toast.info(t("common.noArticlesToCopy", { storeId: sourceStoreId }));
      onClose();
      return;
    }

    let copiedCount = 0;
    let skippedCount = 0;

    articlesToCopy.forEach(sourceArticle => {
      const existingArticleInTarget = articles.find(
        a => a.article_number === sourceArticle.article_number && a.store_id === targetStoreId
      );

      if (existingArticleInTarget && !overwriteExisting) {
        skippedCount++;
        return;
      }

      const targetStoreRacks = shelfRacks.filter(rack => rack.store_id === targetStoreId);
      let targetRackId = "N/A";
      let targetShelfNumber = "N/A";

      if (targetStoreRacks.length > 0 && targetStoreRacks[0].shelves.length > 0) {
        targetRackId = targetStoreRacks[0].id;
        targetShelfNumber = targetStoreRacks[0].shelves[0].shelfNumber;
      }

      const newArticle = {
        ...sourceArticle,
        store_id: targetStoreId,
        rack_id: targetRackId,
        shelf_number: targetShelfNumber,
      };
      delete newArticle.id; // Remove old UUID to allow DB to generate a new one

      addArticle(newArticle as any);
      copiedCount++;
    });

    toast.success(t("common.articlesCopiedSuccess", { copiedCount, targetStoreId, skippedCount }));
    onClose();
  };

  const availableStores = stores.filter(s => s.id !== user?.store_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("common.copyArticlesBetweenStores")}</DialogTitle>
          <DialogDescription>
            {t("common.copyArticlesDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="sourceStore" className="sm:text-right">
              {t("common.sourceStore")}
            </Label>
            <Select onValueChange={setSourceStoreId} value={sourceStoreId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t("common.selectSourceStore")} />
              </SelectTrigger>
              <SelectContent>
                {availableStores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name} ({store.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="targetStore" className="sm:text-right">
              {t("common.targetStore")}
            </Label>
            <Select onValueChange={setTargetStoreId} value={targetStoreId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t("common.selectTargetStore")} />
              </SelectTrigger>
              <SelectContent>
                {availableStores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name} ({store.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 col-span-full sm:col-start-2 sm:col-span-3">
            <Checkbox
              id="overwriteExisting"
              checked={overwriteExisting}
              onCheckedChange={(checked) => setOverwriteExisting(!!checked)}
            />
            <Label htmlFor="overwriteExisting" className="text-sm font-medium leading-none">
              {t("common.overwriteExistingArticles")}
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCopyArticles} className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
            {t("common.copyArticles")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};