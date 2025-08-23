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
import { useStores } from "@/data/stores"; // Import useStores
import { useTranslation } from "react-i18next"; // Import useTranslation

// Define all possible permissions for display
const allPermissions: Permission[] = [
  "user:view", "user:create", "user:update", "user:delete",
  "store:view", "store:create", "store:update", "store:delete",
  "rack:view", "rack:create", "rack:update", "rack:delete",
  "article:view", "article:create", "article:update", "article:delete", "article:scan", "article:mass_add",
  "log:view",
  "default_articles:manage",
  "article:copy_from_store",
];

// Map permissions to their translation keys for descriptions
const permissionDescriptions: Record<Permission, string> = {
  "user:view": "permission.user.view",
  "user:create": "permission.user.create",
  "user:update": "permission.user.update",
  "user:delete": "permission.user.delete",
  "store:view": "permission.store.view",
  "store:create": "permission.store.create",
  "store:update": "permission.store.update",
  "store:delete": "permission.store.delete",
  "rack:view": "permission.rack.view",
  "rack:create": "permission.rack.create",
  "rack:update": "permission.rack.update",
  "rack:delete": "permission.rack.delete",
  "article:view": "permission.article.view",
  "article:create": "permission.article.create",
  "article:update": "permission.article.update",
  "article:delete": "permission.article.delete",
  "article:scan": "permission.article.scan",
  "article:mass_add": "permission.article.massAdd",
  "log:view": "permission.log.view",
  "default_articles:manage": "permission.defaultArticles.manage",
  "article:copy_from_store": "permission.article.copyFromStore",
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
  const { stores } = useStores(); // Get list of all stores
  const { t } = useTranslation(); // Initialize useTranslation

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

  const handleStoreSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, storeId: value }));
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
      toast.error(t("common.fillAllRequiredFields"));
      return;
    }
    onSubmit(formData);
    onClose();
  };

  // Filter stores if current user is not admin
  const availableStores = isAdmin ? stores : stores.filter(s => s.id === currentUserStoreId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? t("common.editUser") : t("common.addUser")}</DialogTitle>
          <DialogDescription>
            {user ? t("common.editUserDescription") : t("common.addUserDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="sm:text-right">
              {t("common.username")}
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
              {t("common.password")}
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
              {t("common.role")}
            </Label>
            <Select onValueChange={handleRoleChange} value={formData.role}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t("common.selectRole")} />
              </SelectTrigger>
              <SelectContent>
                {isAdmin && <SelectItem value="admin">{t("common.admin")}</SelectItem>}
                <SelectItem value="vedouci_skladu">{t("common.warehouseManager")}</SelectItem>
                <SelectItem value="store_manager">{t("common.storeManager")}</SelectItem>
                <SelectItem value="deputy_store_manager">{t("common.deputyStoreManager")}</SelectItem>
                <SelectItem value="ar_assistant_of_sale">{t("common.arAssistantOfSale")}</SelectItem>
                <SelectItem value="skladnik">{t("common.warehouseWorker")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.role !== "admin" && (
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="storeId" className="sm:text-right">
                {t("common.storeId")}
              </Label>
              <Select
                onValueChange={handleStoreSelect}
                value={formData.storeId || ""}
                disabled={!isAdmin && !!currentUserStoreId} // Disable if not admin and storeId is already set
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("common.selectStore")} />
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
          )}

          {/* Permissions Management */}
          <div className="col-span-full mt-4">
            <Label className="text-base font-semibold mb-2 block">{t("common.permissions")}</Label>
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
                    {t(permissionDescriptions[permission])} {/* Zobrazujeme popis oprávnění */}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="col-span-full mt-4">
            <Button type="submit" className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
              {user ? t("common.saveChanges") : t("common.addUser")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};