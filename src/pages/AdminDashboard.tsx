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
import { ArrowLeft, PlusCircle, Edit, Trash2, ScrollText, Warehouse } from "lucide-react"; // Added Warehouse icon
import { UserFormDialog } from "@/components/UserFormDialog";
import { toast } from "sonner";
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
import { User } from "@/data/users";
import { LogViewer } from "@/components/LogViewer";

const AdminDashboard: React.FC = () => {
  const { allUsers, addUser, updateUser, deleteUser, isAdmin, userStoreId, hasPermission } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDeleteUsername, setUserToDeleteUsername] = useState<string | null>(null);
  const [isLogViewerOpen, setIsLogViewerOpen] = useState(false);

  const handleAddUser = (newUser: User) => {
    if (!hasPermission("user:create")) {
      toast.error("Nemáte oprávnění přidávat uživatele.");
      return;
    }
    // If not admin, ensure the user is created for the current store
    const finalUser = isAdmin ? newUser : { ...newUser, storeId: userStoreId || newUser.storeId };
    addUser(finalUser);
  };

  const handleEditUser = (updatedUser: User) => {
    if (!hasPermission("user:update")) {
      toast.error("Nemáte oprávnění upravovat uživatele.");
      return;
    }
    // If not admin, ensure the user is updated within the current store
    const finalUser = isAdmin ? updatedUser : { ...updatedUser, storeId: userStoreId || updatedUser.storeId };
    updateUser(finalUser);
  };

  const handleDeleteUser = (username: string) => {
    if (!hasPermission("user:delete")) {
      toast.error("Nemáte oprávnění mazat uživatele.");
      return;
    }
    setUserToDeleteUsername(username);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDeleteUsername) {
      deleteUser(userToDeleteUsername);
      setUserToDeleteUsername(null);
    }
    setIsDeleteDialogOpen(false);
  };

  // Filter users based on current user's storeId if not admin
  const usersToDisplay = isAdmin
    ? allUsers
    : allUsers.filter(u => u.storeId === userStoreId);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-6 space-y-4 sm:space-y-0">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> Zpět na hlavní stránku
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">Správa uživatelů</h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            {hasPermission("log:view") && (
              <Button onClick={() => setIsLogViewerOpen(true)} className="flex items-center bg-gray-600 hover:bg-gray-700 text-white w-full sm:w-auto">
                <ScrollText className="h-4 w-4 mr-2" /> Zobrazit Log
              </Button>
            )}
            {hasPermission("user:create") && (
              <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full sm:w-auto">
                <PlusCircle className="h-4 w-4 mr-2" /> Přidat uživatele
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto"> {/* Obalení tabulky pro horizontální posouvání */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Uživatelské jméno</TableHead>
                <TableHead className="min-w-[100px]">Role</TableHead>
                <TableHead className="min-w-[100px]">ID Skladu</TableHead>
                <TableHead className="text-right min-w-[100px]">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersToDisplay.map((user) => (
                <TableRow key={user.username}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.role === "admin" ? "Admin" : user.role}</TableCell>
                  <TableCell>{user.storeId || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    {hasPermission("user:update") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mr-2"
                        onClick={() => {
                          setEditingUser(user);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {hasPermission("user:delete") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.username)}
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

        {usersToDisplay.length === 0 && (
          <p className="text-center text-muted-foreground mt-4">Žádní uživatelé nebyli nalezeni. Přidejte nového!</p>
        )}
      </div>

      <UserFormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddUser}
        user={null}
      />

      <UserFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleEditUser}
        user={editingUser}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jste si naprosto jisti?</AlertDialogTitle>
            <AlertDialogDescription>
              Tuto akci nelze vrátit zpět. Tímto trvale smažete uživatele{" "}
              <span className="font-semibold">{userToDeleteUsername}</span> ze systému.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušit</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Pokračovat</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LogViewer isOpen={isLogViewerOpen} onClose={() => setIsLogViewerOpen(false)} />
    </div>
  );
};

export default AdminDashboard;