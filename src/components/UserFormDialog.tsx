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
import { User, Permission, defaultPermissions } from "@/data/users";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";

// Define all possible permissions for display
const allPermissions: Permission[] = [
  "user:view", "user:create", "user:update", "user:delete",
  "rack:view", "rack:create", "rack:update", "rack:delete",
  "article:view", "article:create", "article:update", "article:delete", "article:scan", "article:mass_add",
  "log:view",
  "default_articles:manage",
  "article:copy_from_store",
];

// Helper to format permission names for display
const formatPermissionName = (permission: Permission) => {
  return permission.replace(/([A-Z])/g, ' $1').replace(':', ': ').toUpperCase();
};

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: User) => void;
  user?: User | null; // Optional: if provided, it's for editing
}

export const UserFormDialog: React.FC<UserFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
}) => {
  const { isAdmin, userStoreId: currentUserStoreId } = useAuth();
  const [formData, setFormData] = useState<User>({
    username: "",
    password: "",
    role: "skladnik",
    storeId: currentUserStoreId || "",
    permissions: defaultPermissions["skladnik"],
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        username: "",
        password: "",
        role: "skladnik",
        storeId: currentUserStoreId || "",
        permissions: defaultPermissions["skladnik"],
      });
    }
  }, [user, isOpen, currentUserStoreId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRoleChange = (value: User['role']) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
      storeId: value === "admin" ? undefined : (prev.storeId || currentUserStoreId || ""), // Admin doesn't need storeId
      permissions: defaultPermissions[value] || [], // Set default permissions for the role
    }));
  };

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    setFormData((prev) => {
      const newPermissions = checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter((p) => p !== permission);
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.role || (!formData.storeId && formData.role !== "admin")) {
      toast.error("Prosím, vyplňte všechna povinná pole.");
      return;
    }
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? "Upravit uživatele" : "Přidat nového uživatele"}</DialogTitle>
          <DialogDescription>
            {user ? "Zde můžete upravit údaje uživatele." : "Přidejte nového uživatele do systému."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="sm:text-right">
              Uživatelské jméno
            </Label>
            <Input
              id="username"
              value={formData.username}
              onChange={handleChange}
              className="col-span-3"
              readOnly={!!user}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="sm:text-right">
              Heslo
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="sm:text-right">
              Role
            </Label>
            <Select onValueChange={handleRoleChange} value={formData.role}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Vyberte roli" />
              </SelectTrigger>
              <SelectContent>
                {isAdmin && <SelectItem value="admin">Admin</SelectItem>}
                <SelectItem value="vedouci_skladu">Vedoucí Skladu (LR)</SelectItem>
                <SelectItem value="store_manager">Store Manager (SM)</SelectItem>
                <SelectItem value="deputy_store_manager">Deputy Store Manager (DSM)</SelectItem>
                <SelectItem value="ar_assistant_of_sale">AR Assistant Of Sale</SelectItem>
                <SelectItem value="skladnik">Skladník</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.role !== "admin" && (
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="storeId" className="sm:text-right">
                ID Skladu
              </Label>
              <Input
                id="storeId"
                value={formData.storeId || ""}
                onChange={handleChange}
                className="col-span-3"
                readOnly={!isAdmin && !!currentUserStoreId} // Non-admin can't change storeId if they have one
                placeholder="Např. Sklad 1"
              />
            </div>
          )}

          {/* Permissions Management */}
          <div className="col-span-full mt-4">
            <Label className="text-base font-semibold mb-2 block">Oprávnění</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allPermissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission}
                    checked={formData.permissions.includes(permission)}
                    onCheckedChange={(checked) => handlePermissionChange(permission, !!checked)}
                    disabled={!isAdmin && formData.role === "admin"} // Only admin can change admin permissions
                  />
                  <Label htmlFor={permission} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {formatPermissionName(permission)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="col-span-full mt-4">
            <Button type="submit" className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
              {user ? "Uložit změny" : "Přidat uživatele"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};