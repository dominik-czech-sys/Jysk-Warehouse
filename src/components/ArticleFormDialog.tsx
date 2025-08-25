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
import { Article } from "@/data/articles";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShelfRacks } from "@/data/shelfRacks";
import { useTranslation } from "react-i18next";
import { GlobalArticle } from "@/data/globalArticles";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface ArticleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (article: Article | GlobalArticle) => void;
  article?: Article | GlobalArticle | null;
  isGlobalAdminContext?: boolean;
}

export const ArticleFormDialog: React.FC<ArticleFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  article,
  isGlobalAdminContext = false,
}) => {
  const { userStoreId } = useAuth();
  const { shelfRacks } = useShelfRacks();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<Article | GlobalArticle>({
    id: "",
    name: "",
    status: "",
    ...(isGlobalAdminContext ? { minQuantity: 0 } : { rackId: "", shelfNumber: "", storeId: userStoreId || "", quantity: 1, minQuantity: 0, hasShopFloorStock: false, shopFloorStock: 0, replenishmentTrigger: 0 }),
  });
  const [selectedRackId, setSelectedRackId] = useState<string>("");
  const [selectedShelfNumber, setSelectedShelfNumber] = useState<string>("");

  useEffect(() => {
    if (article) {
      setFormData(article);
      if (!isGlobalAdminContext && "rackId" in article) {
        setSelectedRackId(article.rackId);
        setSelectedShelfNumber(article.shelfNumber);
      }
    } else {
      setFormData({
        id: "",
        name: "",
        status: "",
        ...(isGlobalAdminContext ? { minQuantity: 0 } : { rackId: "", shelfNumber: "", storeId: userStoreId || "", quantity: 1, minQuantity: 0, hasShopFloorStock: false, shopFloorStock: 0, replenishmentTrigger: 0 }),
      });
      setSelectedRackId("");
      setSelectedShelfNumber("");
    }
  }, [article, isOpen, userStoreId, isGlobalAdminContext]);

  useEffect(() => {
    if (!isGlobalAdminContext) {
      const currentRack = shelfRacks.find(rack => rack.id === selectedRackId && rack.storeId === (formData as Article).storeId);
      if (currentRack) {
        setFormData(prev => ({
          ...(prev as Article),
          rackId: currentRack.id,
          shelfNumber: selectedShelfNumber,
          storeId: currentRack.storeId,
        }));
      } else if (!article) {
        setFormData(prev => ({
          ...(prev as Article),
          rackId: "",
          shelfNumber: "",
          storeId: userStoreId || "",
        }));
      }
    }
  }, [selectedRackId, selectedShelfNumber, shelfRacks, userStoreId, (formData as Article).storeId, article, isGlobalAdminContext]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "number" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      hasShopFloorStock: checked,
    }));
  };

  const handleRackSelect = (value: string) => {
    setSelectedRackId(value);
    setSelectedShelfNumber("");
  };

  const handleShelfNumberSelect = (value: string) => {
    setSelectedShelfNumber(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.status) {
      toast.error(t("common.fillAllArticleFields"));
      return;
    }
    if (!isGlobalAdminContext && (!selectedRackId || !selectedShelfNumber)) {
      toast.error(t("common.fillAllArticleFields"));
      return;
    }
    onSubmit(formData);
    onClose();
  };

  const availableShelves = selectedRackId
    ? shelfRacks.find(r => r.id === selectedRackId && r.storeId === (formData as Article).storeId)?.shelves || []
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{article ? (isGlobalAdminContext ? t("common.editGlobalArticle") : t("common.editArticle")) : (isGlobalAdminContext ? t("common.addGlobalArticle") : t("common.addArticle"))}</DialogTitle>
          <DialogDescription>
            {article ? (isGlobalAdminContext ? t("common.editGlobalArticleDescription") : t("common.editArticleDescription")) : (isGlobalAdminContext ? t("common.addGlobalArticleDescription") : t("common.addArticleDescription"))}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* ... existing fields ... */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="sm:text-right">
              {t("common.articleId")}
            </Label>
            <Input
              id="id"
              value={formData.id}
              onChange={handleChange}
              className="col-span-3"
              readOnly={!!article}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="sm:text-right">
              {t("common.articleName")}
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>

          {!isGlobalAdminContext && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="rackId" className="sm:text-right">
                  {t("common.rackRowRack")}
                </Label>
                <Select onValueChange={handleRackSelect} value={selectedRackId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t("common.selectRack")} />
                  </SelectTrigger>
                  <SelectContent>
                    {shelfRacks.filter(rack => !userStoreId || rack.storeId === userStoreId).map((rack) => (
                      <SelectItem key={rack.id} value={rack.id}>
                        {rack.rowId}-{rack.rackId} ({rack.shelves.map(s => s.description).join(', ')}) - {rack.storeId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="shelfNumber" className="sm:text-right">
                  {t("common.shelfNumberLabel")}
                </Label>
                <Select onValueChange={handleShelfNumberSelect} value={selectedShelfNumber} disabled={!selectedRackId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t("common.selectShelfNumber")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableShelves.map((shelf) => (
                      <SelectItem key={shelf.shelfNumber} value={shelf.shelfNumber}>
                        {t("common.shelf")} {shelf.shelfNumber} ({shelf.description})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="storeId" className="sm:text-right">
                  {t("common.storeId")}
                </Label>
                <Input id="storeId" value={(formData as Article).storeId} readOnly className="col-span-3 bg-gray-100 dark:bg-gray-700" />
              </div>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="sm:text-right">
              {t("common.itemStatus")}
            </Label>
            <Input
              id="status"
              value={formData.status}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Např. 21"
            />
          </div>

          {!isGlobalAdminContext && (
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="sm:text-right">
                {t("common.quantity")}
              </Label>
              <Input
                id="quantity"
                type="number"
                value={(formData as Article).quantity}
                onChange={handleChange}
                className="col-span-3"
                min="0"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="minQuantity" className="sm:text-right">
              {t("common.minQuantity")}
            </Label>
            <Input
              id="minQuantity"
              type="number"
              value={formData.minQuantity || 0}
              onChange={handleChange}
              className="col-span-3"
              min="0"
            />
          </div>

          {!isGlobalAdminContext && (
            <>
              <Separator className="col-span-full my-2" />
              <div className="col-span-full flex items-center space-x-2">
                <Checkbox
                  id="hasShopFloorStock"
                  checked={(formData as Article).hasShopFloorStock}
                  onCheckedChange={(checked) => handleCheckboxChange(!!checked)}
                />
                <Label htmlFor="hasShopFloorStock">{t("common.hasShopFloorStock")}</Label>
              </div>
              {(formData as Article).hasShopFloorStock && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="shopFloorStock" className="sm:text-right">
                      {t("common.shopFloorStock")}
                    </Label>
                    <Input
                      id="shopFloorStock"
                      type="number"
                      value={(formData as Article).shopFloorStock || 0}
                      onChange={handleChange}
                      className="col-span-3"
                      min="0"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="replenishmentTrigger" className="sm:text-right">
                      {t("common.replenishmentTrigger")}
                    </Label>
                    <Input
                      id="replenishmentTrigger"
                      type="number"
                      value={(formData as Article).replenishmentTrigger || 0}
                      onChange={handleChange}
                      className="col-span-3"
                      min="0"
                    />
                  </div>
                </>
              )}
            </>
          )}

          <DialogFooter>
            <Button type="submit" className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
              {article ? t("common.saveChanges") : t("common.addArticle")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};