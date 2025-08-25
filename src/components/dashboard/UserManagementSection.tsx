import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, Clock, PlusCircle, Edit, Trash2 } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/data/users";

interface UserProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  role: "admin" | "vedouci_skladu" | "store_manager" | "deputy_store_manager" | "ar_assistant_of_sale" | "skladnik";
  store_id: string;
  is_approved: boolean;
  email: string;
  permissions: any[];
  firstLogin: boolean;
}

export const UserManagementSection: React.FC = () => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) {
      toast.error(t("common.errorFetchingUsers"));
    } else {
      setUsers(data as UserProfile[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApproveUser = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: true })
      .eq("id", userId);
    if (error) {
      toast.error(t("common.errorApprovingUser"));
    } else {
      toast.success(t("common.userApprovedSuccess"));
      fetchUsers();
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: UserProfile) => {
    const userForForm: User = {
      ...user,
      storeId: user.store_id,
      firstLogin: user.firstLogin,
    };
    setEditingUser(userForForm);
    setIsFormOpen(true);
  };

  const handleDeleteUser = (user: UserProfile) => {
    setUserToDelete(user);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const { error } = await supabase.functions.invoke("delete-user", {
        body: { user_id: userToDelete.id },
      });
      if (error) throw error;
      toast.success(t("common.userDeletedSuccess", { username: userToDelete.username }));
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || t("common.errorDeletingUser"));
    } finally {
      setIsDeleteOpen(false);
      setUserToDelete(null);
    }
  };

  const handleFormSubmit = async (formData: User) => {
    if (editingUser) { // Update user
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          username: formData.username,
          role: formData.role,
          store_id: formData.storeId,
        })
        .eq("id", editingUser.id!);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t("common.userUpdatedSuccess"));
        fetchUsers();
      }
    } else { // Create user
      try {
        const payload = { ...formData, store_id: formData.storeId };
        delete (payload as any).storeId;

        const { error } = await supabase.functions.invoke("create-user", {
          body: payload,
        });
        if (error) throw error;
        toast.success(t("common.userAddedSuccess"));
        fetchUsers();
      } catch (error: any) {
        toast.error(error.message || t("common.errorCreatingUser"));
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{t("common.userList")}</h2>
        <Button onClick={handleAddUser}>
          <PlusCircle className="h-4 w-4 mr-2" /> {t("common.addUser")}
        </Button>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.username")}</TableHead>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("common.role")}</TableHead>
              <TableHead>{t("common.storeId")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-right">{t("common.action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center">{t("common.loadingUsers")}</TableCell></TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.first_name} {user.last_name}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.store_id || "N/A"}</TableCell>
                  <TableCell>
                    {user.is_approved ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-4 w-4 mr-1"/>{t("common.approved")}</Badge>
                    ) : (
                      <Badge variant="secondary"><Clock className="h-4 w-4 mr-1"/>{t("common.pendingApproval")}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!user.is_approved && (
                      <Button size="sm" onClick={() => handleApproveUser(user.id)} className="mr-2">{t("common.approve")}</Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)} className="mr-2"><Edit className="h-4 w-4" /></Button>
                    {currentUser?.id !== user.id && (
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <UserFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        user={editingUser}
      />
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.confirmDeleteUserTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("common.confirmDeleteUserDescription", { username: userToDelete?.username })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};