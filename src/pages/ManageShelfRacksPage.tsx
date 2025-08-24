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
import { Link } from "react-router-dom";
import { ArrowLeft, PlusCircle, Edit, Trash2, Warehouse } from "lucide-react";
import { ShelfRackFormDialog } from "@/components/ShelfRackFormDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useShelfRacks, ShelfRack } from "@/data/shelfRacks";
import { toast } from "sonner";
import { useTranslation } from "react-i18next"; // Import useTranslation

const ManageShelfRacksPage: React.FC = () => {
  const { shelfRacks, addShelfRack, updateShelfRack, deleteShelfRack } = useShelfRacks();
  const { isAdmin, userStoreId, hasPermission } = useAuth();
  const { t } = useTranslation(); // Initialize useTranslation

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRack, setEditingRack] = useState<ShelfRack | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rackToDeleteId, setRackToDeleteId] = useState<string | null>(null);
  const [rackToDeleteStoreId, setRackToDeleteStoreId] = useState<string | null>(null);

  const handleAddShelfRack = (newRack: ShelfRack) => {
    if (!hasPermission("rack:create")) {
      toast.error(t("common.noPermissionToAddRacks"));
      return false;
    }
    // Ensure the rack is added to the user's store if not admin
    const finalRack = isAdmin ? newRack : { ...newRack, storeId: userStoreId || newRack.storeId };
    return addShelfRack(finalRack);
  };

  const handleEditShelfRack = (updatedRack: ShelfRack) => {
    if (!hasPermission("rack:update")) {
      toast.error(t("common.noPermissionToEditRacks"));
      return false;
    }
    // Ensure the rack is updated within the user's store if not admin
    const finalRack = isAdmin ? updatedRack : { ...updatedRack, storeId: userStoreId || updatedRack.storeId };
    updateShelfRack(finalRack);
    return true;
  };

  const handleDeleteShelfRack = (id: string, storeId: string) => {
    if (!hasPermission("rack:delete")) {
      toast.error(t("common.noPermissionToDeleteRacks"));
      return;
    }
    setRackToDeleteId(id);
    setRackToDeleteStoreId(storeId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteShelfRack = () => {
    if (rackToDeleteId && rackToDeleteStoreId) {
      deleteShelfRack(rackToDeleteId, rackToDeleteStoreId);
      setRackToDeleteId(null);
      setRackToDeleteStoreId(null);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-6 space-y-4 sm:space-y-0">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> {t("common.backToMainPage")}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">{t("common.rackManagement")}</h1>
          {hasPermission("rack:create") && (
            <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full sm:w-auto">
              <PlusCircle className="h-4 w-4 mr-2" /> {t("common.addRack")}
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[80px]">{t("common.rackId")}</TableHead>
                <TableHead className="min-w-[80px]">{t("common.rowId")}</TableHead>
                <TableHead className="min-w-[80px]">{t("common.rack")}</TableHead>
                <TableHead className="min-w-[150px]">{t("common.shelvesAndDescription")}</TableHead>
                {isAdmin && <TableHead className="min-w-[100px]">{t("common.storeId")}</TableHead>}
                <TableHead className="text-right min-w-[100px]">{t("common.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shelfRacks.map((rack) => (
                <TableRow key={`${rack.id}-${rack.storeId}`}>
                  <TableCell className="font-medium">{rack.id}</TableCell>
                  <TableCell>{rack.rowId}</TableCell>
                  <TableCell>{rack.rackId}</TableCell>
                  <TableCell>
                    {rack.shelves.map(s => `${t("common.shelf")} ${s.shelfNumber}: ${s.description}`).join('; ')}
                  </TableCell>
                  {isAdmin && <TableCell>{rack.storeId}</TableCell>}
                  <TableCell className="text-right">
                    {hasPermission("rack:update") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mr-2"
                        onClick={() => {
                          setEditingRack(rack);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {hasPermission("rack:delete") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteShelfRack(rack.id, rack.storeId)}
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

        {shelfRacks.length === 0 && (
          <p className="text-center text-muted-foreground mt-4">{t("common.noRacksFound")}</p>
        )}
      </div>

      <ShelfRackFormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddShelfRack}
        rack={null}
      />

      <ShelfRackFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingRack(null);
        }}
        onSubmit={handleEditShelfRack}
        rack={editingRack}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.confirmDeleteRackTitle")}</AlertDialogTitle>
            <AlertDialogDescription
              dangerouslySetInnerHTML={{
                __html: t("common.confirmDeleteRackDescription", { rackId: rackToDeleteId, storeId: rackToDeleteStoreId }),
              }}
            />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteShelfRack} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("common.continue")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageShelfRacksPage;