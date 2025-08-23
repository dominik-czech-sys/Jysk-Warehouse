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

interface ArticleCopyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArticleCopyDialog: React.FC<ArticleCopyDialogProps> = ({ isOpen, onClose }) => {
  const { stores } = useStores();
  const { allArticles, addArticle } = useArticles();
  const { allShelfRacks } = useShelfRacks();
  const { user, hasPermission } = useAuth();

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
      toast.error("Nemáte oprávnění kopírovat články mezi obchody.");
      return;
    }
    if (!sourceStoreId || !targetStoreId) {
      toast.error("Prosím, vyberte zdrojový a cílový obchod.");
      return;
    }
    if (sourceStoreId === targetStoreId) {
      toast.error("Zdrojový a cílový obchod nemohou být stejné.");
      return;
    }

    const articlesToCopy = allArticles.filter(article => article.storeId === sourceStoreId);
    if (articlesToCopy.length === 0) {
      toast.info(`V obchodě ${sourceStoreId} nejsou žádné články ke kopírování.`);
      onClose();
      return;
    }

    let copiedCount = 0;
    let skippedCount = 0;

    articlesToCopy.forEach(sourceArticle => {
      const existingArticleInTarget = allArticles.find(
        a => a.id === sourceArticle.id && a.storeId === targetStoreId
      );

      if (existingArticleInTarget && !overwriteExisting) {
        skippedCount++;
        return; // Skip if exists and not overwriting
      }

      // Find a suitable rack in the target store, or assign to N/A
      const targetStoreRacks = allShelfRacks.filter(rack => rack.storeId === targetStoreId);
      let targetRackId = "N/A";
      let targetShelfNumber = "N/A";
      let targetLocation = "N/A";
      let targetFloor = "N/A";

      if (targetStoreRacks.length > 0 && targetStoreRacks[0].shelves.length > 0) {
        // For simplicity, assign to the first shelf of the first rack in the target store
        // In a real scenario, this logic would be more sophisticated (e.g., finding an empty spot)
        targetRackId = targetStoreRacks[0].id;
        targetShelfNumber = targetStoreRacks[0].shelves[0].shelfNumber;
        targetLocation = targetStoreRacks[0].location;
        targetFloor = targetStoreRacks[0].floor;
      }

      const newArticle = {
        ...sourceArticle,
        storeId: targetStoreId,
        rackId: targetRackId,
        shelfNumber: targetShelfNumber,
        location: targetLocation,
        floor: targetFloor,
      };

      if (existingArticleInTarget && overwriteExisting) {
        // If overwriting, update the existing article
        addArticle(newArticle); // addArticle handles updates if ID+storeId match
      } else {
        addArticle(newArticle);
      }
      copiedCount++;
    });

    toast.success(`Zkopírováno ${copiedCount} článků do obchodu ${targetStoreId}. Přeskočeno ${skippedCount} existujících článků.`);
    onClose();
  };

  const availableStores = stores.filter(s => s.id !== user?.storeId); // Exclude current user's store if not admin

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kopírovat články mezi obchody</DialogTitle>
          <DialogDescription>
            Zkopírujte všechny články z jednoho obchodu do druhého.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="sourceStore" className="sm:text-right">
              Zdrojový obchod
            </Label>
            <Select onValueChange={setSourceStoreId} value={sourceStoreId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Vyberte zdrojový obchod" />
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
              Cílový obchod
            </Label>
            <Select onValueChange={setTargetStoreId} value={targetStoreId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Vyberte cílový obchod" />
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
              Přepsat existující články v cílovém obchodě
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCopyArticles} className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
            Kopírovat články
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};