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
import { Input } from "@/components/ui/input";
import { useStores, Store } from "@/data/stores";
import { useArticles } from "@/data/articles";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { ArrowRightLeft } from "lucide-react";

interface ArticleTransferDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArticleTransferDialog: React.FC<ArticleTransferDialogProps> = ({ isOpen, onClose }) => {
  const { stores } = useStores();
  const { allArticles, getArticleById, updateArticle, addArticle } = useArticles();
  const { user, hasPermission } = useAuth();
  const { t } = useTranslation();

  const [sourceStoreId, setSourceStoreId] = useState<string>("");
  const [targetStoreId, setTargetStoreId] = useState<string>("");
  const [articleIdToTransfer, setArticleIdToTransfer] = useState<string>("");
  const [transferQuantity, setTransferQuantity] = useState<number>(1);

  useEffect(() => {
    if (!isOpen) {
      setSourceStoreId("");
      setTargetStoreId("");
      setArticleIdToTransfer("");
      setTransferQuantity(1);
    }
  }, [isOpen]);

  const handleTransferArticles = () => {
    if (!hasPermission("article:transfer")) {
      toast.error(t("common.noPermissionToTransferArticles"));
      return;
    }
    if (!sourceStoreId || !targetStoreId || !articleIdToTransfer || transferQuantity <= 0) {
      toast.error(t("common.fillAllTransferFields"));
      return;
    }
    if (sourceStoreId === targetStoreId) {
      toast.error(t("common.sourceAndTargetCannotBeSame"));
      return;
    }

    const sourceArticle = getArticleById(articleIdToTransfer, sourceStoreId);

    if (!sourceArticle) {
      toast.error(t("common.articleNotFoundInSource", { articleId: articleIdToTransfer, storeId: sourceStoreId }));
      return;
    }

    if (sourceArticle.quantity < transferQuantity) {
      toast.error(t("common.insufficientQuantity", { articleId: articleIdToTransfer, available: sourceArticle.quantity, requested: transferQuantity }));
      return;
    }

    // Update source store article quantity
    updateArticle({ ...sourceArticle, quantity: sourceArticle.quantity - transferQuantity });

    // Check if article exists in target store
    const targetArticle = getArticleById(articleIdToTransfer, targetStoreId);

    if (targetArticle) {
      // Update target store article quantity
      updateArticle({ ...targetArticle, quantity: targetArticle.quantity + transferQuantity });
    } else {
      // Add new article to target store
      const newArticle = {
        ...sourceArticle,
        storeId: targetStoreId,
        quantity: transferQuantity,
        rackId: "N/A", // Default to N/A, user can update later
        shelfNumber: "N/A", // Default to N/A, user can update later
      };
      addArticle(newArticle);
    }

    toast.success(t("common.articleTransferSuccess", { articleId: articleIdToTransfer, quantity: transferQuantity, sourceStore: sourceStoreId, targetStore: targetStoreId }));
    onClose();
  };

  const availableSourceStores = stores.filter(s => s.id !== targetStoreId);
  const availableTargetStores = stores.filter(s => s.id !== sourceStoreId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("common.transferArticles")}</DialogTitle>
          <DialogDescription>
            {t("common.transferArticlesDescription")}
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
                {availableSourceStores.map((store) => (
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
                {availableTargetStores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name} ({store.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="articleId" className="sm:text-right">
              {t("common.articleId")}
            </Label>
            <Input
              id="articleId"
              value={articleIdToTransfer}
              onChange={(e) => setArticleIdToTransfer(e.target.value.toUpperCase())}
              className="col-span-3"
              placeholder={t("common.enterArticleId")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="sm:text-right">
              {t("common.quantity")}
            </Label>
            <Input
              id="quantity"
              type="number"
              value={transferQuantity}
              onChange={(e) => setTransferQuantity(parseInt(e.target.value, 10) || 1)}
              min="1"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleTransferArticles} className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
            <ArrowRightLeft className="h-4 w-4 mr-2" /> {t("common.transfer")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};