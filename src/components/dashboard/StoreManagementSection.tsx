import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Copy, ArrowRightLeft } from "lucide-react";
import { StoreFormDialog } from "@/components/StoreFormDialog";
import { ArticleCopyDialog } from "@/components/ArticleCopyDialog";
import { ArticleTransferDialog } from "@/components/ArticleTransferDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Store } from "@/data/stores";
import { useTranslation } from "react-i18next";

interface StoreManagementSectionProps {
  stores: Store[];
  addStore: (newStore: Store, addDefaultArticles: boolean) => Promise<void>;
  updateStore: (updatedStore: Store) => Promise<any>;
  deleteStore: (id: string) => Promise<any>;
  hasPermission: (permission: string) => boolean;
}

export const StoreManagementSection: React.FC<StoreManagementSectionProps> = ({
  stores,
  addStore,
  updateStore,
  deleteStore,
  hasPermission,
}) => {
  const { t } = useTranslation();

  const [isAddStoreDialogOpen, setIsAddStoreDialogOpen] = useState(false);
  const [isEditStoreDialogOpen, setIsEditStoreDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [isDeleteStoreDialogOpen, setIsDeleteStoreDialogOpen] = useState(false);
  const [storeToDeleteId, setStoreToDeleteId] = useState<string | null>(null);
  const [isArticleCopyDialogOpen, setIsArticleCopyDialogOpen] = useState(false);
  const [isArticleTransferDialogOpen, setIsArticleTransferDialogOpen] = useState(false);

  const handleAddStore = async (newStore: Store, addDefaultArticles: boolean) => {
    await addStore(newStore, addDefaultArticles);
  };

  const handleEditStore = async (updatedStore: Store) => {
    await updateStore(updatedStore);
  };

  const handleDeleteStore = (id: string) => {
    setStoreToDeleteId(id);
    setIsDeleteStoreDialogOpen(true);
  };

  const confirmDeleteStore = async () => {
    if (storeToDeleteId) {
      await deleteStore(storeToDeleteId);
      setStoreToDeleteId(null);
    }
    setIsDeleteStoreDialogOpen(false);
  };

  if (!hasPermission("store:view")) {
    return null;
  }

  return (
    <div className="mb-6 sm:mb-8 w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("common.storeManagement")}</h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          {hasPermission("store:create") && (
            <Button onClick={() => setIsAddStoreDialogOpen(true)} className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full">
              <PlusCircle className="h-4 w-4 mr-2" /> {t("common.addStore")}
            </Button>
          )}
          {hasPermission("article:copy_from_store") && (
            <Button onClick={() => setIsArticleCopyDialogOpen(true)} variant="outline" className="flex items-center w-full">
              <Copy className="h-4 w-4 mr-2" /> {t("common.copyArticles")}
            </Button>
          )}
          {hasPermission("article:transfer") && (
            <Button onClick={() => setIsArticleTransferDialogOpen(true)} variant="outline" className="flex items-center w-full">
              <ArrowRightLeft className="h-4 w-4 mr-2" /> {t("common.transferArticles")}
            </Button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[100px]">{t("common.storeId")}</TableHead>
              <TableHead className="min-w-[200px]">{t("common.storeNameLabel")}</TableHead>
              <TableHead className="text-right min-w-[100px]">{t("common.action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">{store.id}</TableCell>
                <TableCell>{store.name}</TableCell>
                <TableCell className="text-right">
                  {hasPermission("store:update") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-2"
                      onClick={() => {
                        setEditingStore(store);
                        setIsEditStoreDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {hasPermission("store:delete") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteStore(store.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {stores.length === 0 && (
        <p className="text-center text-muted-foreground mt-4">{t("common.noStoresFound")}</p>
      )}

      <StoreFormDialog
        isOpen={isAddStoreDialogOpen}
        onClose={() => setIsAddStoreDialogOpen(false)}
        onSubmit={handleAddStore}
        store={null}
      />
      <StoreFormDialog
        isOpen={isEditStoreDialogOpen}
        onClose={() => {
          setIsEditStoreDialogOpen(false);
          setEditingStore(null);
        }}
        onSubmit={handleEditStore}
        store={editingStore}
      />
      <AlertDialog open={isDeleteStoreDialogOpen} onOpenChange={setIsDeleteStoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.confirmDeleteStoreTitle")}</AlertDialogTitle>
            <AlertDialogDescription
              dangerouslySetInnerHTML={{
                __html: t("common.confirmDeleteStoreDescription", { storeId: storeToDeleteId }),
              }}
            />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteStore} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("common.continue")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ArticleCopyDialog
        isOpen={isArticleCopyDialogOpen}
        onClose={() => setIsArticleCopyDialogOpen(false)}
      />

      <ArticleTransferDialog
        isOpen={isArticleTransferDialogOpen}
        onClose={() => setIsArticleTransferDialogOpen(false)}
      />
    </div>
  );
};