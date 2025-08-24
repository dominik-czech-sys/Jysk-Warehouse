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
import { useTranslation } from "react-i18next"; // Import useTranslation
import { GlobalArticle } from "@/data/globalArticles"; // Import GlobalArticle

interface ArticleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (article: Article | GlobalArticle) => void;
  article?: Article | GlobalArticle | null;
  isGlobalAdminContext?: boolean; // New prop to indicate if it's for global articles
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
  const { t } = useTranslation(); // Initialize useTranslation

  const [formData, setFormData] = useState<Article | GlobalArticle>({
    id: "",
    name: "",
    status: "",
    ...(isGlobalAdminContext ? {} : { rackId: "", shelfNumber: "", storeId: userStoreId || "", quantity: 1 }),
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
        ...(isGlobalAdminContext ? {} : { rackId: "", shelfNumber: "", storeId: userStoreId || "", quantity: 1 }),
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
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRackSelect = (value: string) => {
    setSelectedRackId(value);
    setSelectedShelfNumber(""); // Reset shelf number when rack changes
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
      toast.error(t("common.fillAllArticleFields")); // Specific message for rack/shelf
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{article ? (isGlobalAdminContext ? t("common.editGlobalArticle") : t("common.editArticle")) : (isGlobalAdminContext ? t("common.addGlobalArticle") : t("common.addArticle"))}</DialogTitle>
          <DialogDescription>
            {article ? (isGlobalAdminContext ? t("common.editGlobalArticleDescription") : t("common.editArticleDescription")) : (isGlobalAdminContext ? t("common.addGlobalArticleDescription") : t("common.addArticleDescription"))}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
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
              {/* Shelf Rack Selection */}
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

              {/* Shelf Number Selection */}
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

              {/* Display derived fields as read-only */}
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