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

interface ArticleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (article: Article) => void;
  article?: Article | null;
}

export const ArticleFormDialog: React.FC<ArticleFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  article,
}) => {
  const { userWarehouseId } = useAuth();

  const [formData, setFormData] = useState<Article>({
    id: "",
    name: "",
    shelf: "",
    shelfNumber: "",
    location: "",
    floor: "",
    warehouseId: userWarehouseId || "",
    status: "",
  });

  useEffect(() => {
    if (article) {
      setFormData(article);
    } else {
      setFormData({
        id: "",
        name: "",
        shelf: "",
        shelfNumber: "",
        location: "",
        floor: "",
        warehouseId: userWarehouseId || "",
        status: "",
      });
    }
  }, [article, isOpen, userWarehouseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.shelf || !formData.shelfNumber || !formData.location || !formData.floor || !formData.warehouseId || !formData.status) {
      toast.error("Prosím, vyplňte všechna pole.");
      return;
    }
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{article ? "Upravit článek" : "Přidat nový článek"}</DialogTitle>
          <DialogDescription>
            {article ? "Zde můžete provést změny v článku." : "Přidejte nový článek do skladového inventáře."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="sm:text-right">
              ID článku
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
              Název
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="shelf" className="sm:text-right">
              Regál
            </Label>
            <Input
              id="shelf"
              value={formData.shelf}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="shelfNumber" className="sm:text-right">
              Číslo regálu
            </Label>
            <Input
              id="shelfNumber"
              value={formData.shelfNumber}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="sm:text-right">
              Umístění
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="floor" className="sm:text-right">
              Patro
            </Label>
            <Input
              id="floor"
              value={formData.floor}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="warehouseId" className="sm:text-right">
              ID Skladu
            </Label>
            <Input
              id="warehouseId"
              value={formData.warehouseId}
              onChange={handleChange}
              className="col-span-3"
              readOnly={!userWarehouseId}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="sm:text-right">
              Status zboží
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
              {article ? "Uložit změny" : "Přidat článek"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};