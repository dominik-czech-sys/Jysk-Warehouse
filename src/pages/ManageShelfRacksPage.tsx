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

const ManageShelfRacksPage: React.FC = () => {
  const { shelfRacks, addShelfRack, updateShelfRack, deleteShelfRack } = useShelfRacks();
  const { isAdmin } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRack, setEditingRack] = useState<ShelfRack | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rackToDeleteId, setRackToDeleteId] = useState<string | null>(null);

  const handleAddShelfRack = (newRack: ShelfRack) => {
    return addShelfRack(newRack);
  };

  const handleEditShelfRack = (updatedRack: ShelfRack) => {
    updateShelfRack(updatedRack);
    return true;
  };

  const handleDeleteShelfRack = (id: string) => {
    setRackToDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteShelfRack = () => {
    if (rackToDeleteId) {
      deleteShelfRack(rackToDeleteId);
      setRackToDeleteId(null);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-6 space-y-4 sm:space-y-0">
          <Link to="/admin/uzivatele" className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> Zpět na správu uživatelů
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">Správa regálů</h1>
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full sm:w-auto">
            <PlusCircle className="h-4 w-4 mr-2" /> Přidat regál
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[80px]">ID Regálu</TableHead>
                <TableHead className="min-w-[80px]">Řada</TableHead>
                <TableHead className="min-w-[80px]">Regál</TableHead>
                <TableHead className="min-w-[120px]">Umístění</TableHead>
                <TableHead className="min-w-[80px]">Patro</TableHead>
                <TableHead className="min-w-[100px]">Počet polic</TableHead>
                <TableHead className="min-w-[150px]">Popis</TableHead>
                {isAdmin && <TableHead className="min-w-[100px]">ID Skladu</TableHead>}
                <TableHead className="text-right min-w-[100px]">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shelfRacks.map((rack) => (
                <TableRow key={rack.id}>
                  <TableCell className="font-medium">{rack.id}</TableCell>
                  <TableCell>{rack.rowId}</TableCell>
                  <TableCell>{rack.rackId}</TableCell>
                  <TableCell>{rack.location}</TableCell>
                  <TableCell>{rack.floor}</TableCell>
                  <TableCell>{rack.numberOfShelves}</TableCell>
                  <TableCell>{rack.description}</TableCell>
                  {isAdmin && <TableCell>{rack.warehouseId}</TableCell>}
                  <TableCell className="text-right">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteShelfRack(rack.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {shelfRacks.length === 0 && (
          <p className="text-center text-muted-foreground mt-4">Žádné regály nebyly nalezeny. Přidejte nový!</p>
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
            <AlertDialogTitle>Jste si naprosto jisti?</AlertDialogTitle>
            <AlertDialogDescription>
              Tuto akci nelze vrátit zpět. Tímto trvale smažete regál{" "}
              <span className="font-semibold">{rackToDeleteId}</span> ze systému.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušit</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteShelfRack} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Pokračovat</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageShelfRacksPage;