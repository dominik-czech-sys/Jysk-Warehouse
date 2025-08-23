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
import { useAuth } from "@/hooks/useAuth"; // Import useAuth

interface ArticleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (article: Article) => void;
  article?: Article | null; // Optional: if provided, it's for editing
}

export const ArticleFormDialog: React.FC<ArticleFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  article,
}) => {
  const { userWarehouseId } = useAuth(); // Get user's warehouse ID

  const [formData, setFormData] = useState<Article>({
    id: "",
    name: "",
    shelf: "",
    shelfNumber: "",
    location: "",
    floor: "",
    warehouseId: userWarehouseId || "", // Initialize with user's warehouseId
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
        warehouseId: userWarehouseId || "", // Reset with user's warehouseId
      });
    }
  }, [article, isOpen, userWarehouseId]); // Add userWarehouseId to dependencies

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.shelf || !formData.shelfNumber || !formData.location || !formData.floor || !formData.warehouseId) {
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">
              ID článku
            </Label>
            <Input
              id="id"
              value={formData.id}
              onChange={handleChange}
              className="col-span-3"
              readOnly={!!article} // Make ID read-only when editing
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Název
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="shelf" className="text-right">
              Regál
            </Label>
            <Input
              id="shelf"
              value={formData.shelf}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="shelfNumber" className="text-right">
              Číslo regálu
            </Label>
            <Input
              id="shelfNumber"
              value={formData.shelfNumber}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Umístění
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="floor" className="text-right">
              Patro
            </Label>
            <Input
              id="floor"
              value={formData.floor}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="warehouseId" className="text-right">
              ID Skladu
            </Label>
            <Input
              id="warehouseId"
              value={formData.warehouseId}
              onChange={handleChange}
              className="col-span-3"
              readOnly={!userWarehouseId} // Make warehouseId read-only if user has one
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