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
  onSubmit: (article: Partial<Article | GlobalArticle>) => void;
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

  const [formData, setFormData] = useState<Partial<Article | GlobalArticle>>({});
  const [selectedRackId, setSelectedRackId] = useState<string>("");
  const [selectedShelfNumber, setSelectedShelfNumber] = useState<string>("");

  useEffect(() => {
    if (article) {
      setFormData(article);
      if (!isGlobalAdminContext && "rack_id" in article) {
        setSelectedRackId(article.rack_id || "");
        setSelectedShelfNumber(article.shelf_number || "");
      }
    } else {
      const initialData: Partial<Article | GlobalArticle> = isGlobalAdminContext
        ? { id: "", name: "", status: "", min_quantity: 0 }
        : { article_number: "", name: "", status: "", rack_id: "", shelf_number: "", store_id: userStoreId || "", quantity: 1, min_quantity: 0, has_shop_floor_stock: false, shop_floor_stock: 0, replenishment_trigger: 0 };
      setFormData(initialData);
      setSelectedRackId("");
      setSelectedShelfNumber("");
    }
  }, [article, isOpen, userStoreId, isGlobalAdminContext]);

  useEffect(() => {
    if (!isGlobalAdminContext) {
      setFormData(prev => ({
        ...prev,
        rack_id: selectedRackId,
        shelf_number: selectedShelfNumber,
      }));
    }
  }, [selectedRackId, selectedShelfNumber, isGlobalAdminContext]);

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
      has_shop_floor_stock: checked,
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
    const finalData = { ...formData, rack_id: selectedRackId, shelf_number: selectedShelfNumber };

    if (isGlobalAdminContext) {
        if (!finalData.id || !finalData.name || !finalData.status) {
            toast.error(t("common.fillAllArticleFields"));
            return;
        }
    } else {
        const articleData = finalData as Partial<Article>;
        if (!articleData.article_number || !articleData.name || !articleData.status || !articleData.rack_id || !articleData.shelf_number) {
            toast.error(t("common.fillAllArticleFields"));
            return;
        }
    }
    
    onSubmit(finalData);
    onClose();
  };

  const availableShelves = selectedRackId
    ? shelfRacks.find(r => r.id === selectedRackId && r.store_id === (formData as Article).store_id)?.shelves || []
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
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor={isGlobalAdminContext ? "id" : "article_number"} className="sm:text-right">
              {t("common.articleId")}
            </Label>
            <Input
              id={isGlobalAdminContext ? "id" : "article_number"}
              value={isGlobalAdminContext ? (formData as GlobalArticle).id : (formData as Article).article_number}
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
                <Label htmlFor="rack_id" className="sm:text-right">
                  {t("common.rackRowRack")}
                </Label>
                <Select onValueChange={handleRackSelect} value={selectedRackId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t("common.selectRack")} />
                  </SelectTrigger>
                  <SelectContent>
                    {shelfRacks.filter(rack => !userStoreId || rack.store_id === userStoreId).map((rack) => (
                      <SelectItem key={rack.id} value={rack.id}>
                        {rack.row_id}-{rack.rack_id} ({rack.shelves.map(s => s.description).join(', ')}) - {rack.store_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="shelf_number" className="sm:text-right">
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
                <Label htmlFor="store_id" className="sm:text-right">
                  {t("common.storeId")}
                </Label>
                <Input id="store_id" value={(formData as Article).store_id} readOnly className="col-span-3 bg-gray-100 dark:bg-gray-700" />
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
            <Label htmlFor="min_quantity" className="sm:text-right">
              {t("common.minQuantity")}
            </Label>
            <Input
              id="min_quantity"
              type="number"
              value={formData.min_quantity || 0}
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
                  id="has_shop_floor_stock"
                  checked={(formData as Article).has_shop_floor_stock}
                  onCheckedChange={(checked) => handleCheckboxChange(!!checked)}
                />
                <Label htmlFor="has_shop_floor_stock">{t("common.hasShopFloorStock")}</Label>
              </div>
              {(formData as Article).has_shop_floor_stock && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="shop_floor_stock" className="sm:text-right">
                      {t("common.shopFloorStock")}
                    </Label>
                    <Input
                      id="shop_floor_stock"
                      type="number"
                      value={(formData as Article).shop_floor_stock || 0}
                      onChange={handleChange}
                      className="col-span-3"
                      min="0"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="replenishment_trigger" className="sm:text-right">
                      {t("common.replenishmentTrigger")}
                    </Label>
                    <Input
                      id="replenishment_trigger"
                      type="number"
                      value={(formData as Article).replenishment_trigger || 0}
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