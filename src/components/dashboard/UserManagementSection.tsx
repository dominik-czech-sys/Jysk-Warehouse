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
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { UserFormDialog } from "@/components/UserFormDialog";
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
import { User } from "@/data/users";
import { useTranslation } from "react-i18next";

interface UserManagementSectionProps {
  allUsers: User[];
  addUser: (newUser: User) => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
  deleteUser: (username: string) => void;
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
  currentUser: User | null;
}

export const UserManagementSection: React.FC<UserManagementSectionProps> = ({
  allUsers,
  addUser,
  updateUser,
  deleteUser,
  hasPermission,
  isAdmin,
  currentUser,
}) => {
  const { t } = useTranslation();

  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [userToDeleteUsername, setUserToDeleteUsername] = useState<string | null>(null);

  const handleAddUser = async (newUser: User) => {
    await addUser(newUser);
  };

  const handleEditUser = async (updatedUser: User) => {
    await updateUser(updatedUser);
  };

  const handleDeleteUser = (username: string) => {
    setUserToDeleteUsername(username);
    setIsDeleteUserDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDeleteUsername) {
      deleteUser(userToDeleteUsername);
      setUserToDeleteUsername(null);
    }
    setIsDeleteUserDialogOpen(false);
  };

  // Filter users based on current user's role and storeId
  const filteredUsers = isAdmin
    ? allUsers
    : allUsers.filter(user => user.storeId === currentUser?.storeId);

  // Function to translate role names
  const translateRole = (role: User['role'] | "unknown") => {
    switch (role) {
      case "admin": return t("common.admin");
      case "vedouci_skladu": return t("common.warehouseManager");
      case "store_manager": return t("common.storeManager");
      case "deputy_store_manager": return t("common.deputyStoreManager");
      case "ar_assistant_of_sale": return t("common.arAssistantOfSale");
      case "skladnik": return t("common.warehouseWorker");
      default: return t("common.unknown");
    }
  };

  if (!hasPermission("user:view")) {
    return null;
  }

  return (
    <div className="mb-6 sm:mb-8 w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("common.userManagement")}</h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          {hasPermission("user:create") && (
            <Button onClick={() => setIsAddUserDialogOpen(true)} className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full">
              <PlusCircle className="h-4 w-4 mr-2" /> {t("common.addUser")}
            </Button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">{t("common.username")}</TableHead>
              <TableHead className="min-w-[100px]">{t("common.role")}</TableHead>
              <TableHead className="min-w-[100px]">{t("common.storeId")}</TableHead>
              <TableHead className="text-right min-w-[100px]">{t("common.action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.username}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{translateRole(user.role)}</TableCell>
                <TableCell>{user.storeId || t("common.unknown")}</TableCell>
                <TableCell className="text-right">
                  {hasPermission("user:update") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-2"
                      onClick={() => {
                        setEditingUser(user);
                        setIsEditUserDialogOpen(true);
                      }}
                      disabled={
                        (!isAdmin && user.role === "admin") ||
                        (!isAdmin && user.storeId !== currentUser?.storeId)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {hasPermission("user:delete") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.username)}
                      disabled={
                        (!isAdmin && user.role === "admin") ||
                        (!isAdmin && user.storeId !== currentUser?.storeId) ||
                        (currentUser?.username === user.username)
                      }
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
      {filteredUsers.length === 0 && (
        <p className="text-center text-muted-foreground mt-4">{t("common.noUsersFound")}</p>
      )}

      <UserFormDialog
        isOpen={isAddUserDialogOpen}
        onClose={() => setIsAddUserDialogOpen(false)}
        onSubmit={handleAddUser}
        user={null}
      />
      <UserFormDialog
        isOpen={isEditUserDialogOpen}
        onClose={() => {
          setIsEditUserDialogOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleEditUser}
        user={editingUser}
      />
      <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.confirmDeleteUserTitle")}</AlertDialogTitle>
            <AlertDialogDescription
              dangerouslySetInnerHTML={{
                __html: t("common.confirmDeleteUserDescription", { username: userToDeleteUsername }),
              }}
            />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("common.continue")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};