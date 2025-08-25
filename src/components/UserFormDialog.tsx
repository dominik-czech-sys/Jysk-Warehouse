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
import { User, Permission, allPermissions, permissionDescriptions } from "@/data/users";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";
import { useStores } from "@/data/stores";
import { useTranslation } from "react-i18next";
import { useRoles } from "@/data/roles";

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: User) => Promise<void>;
  user?: User | null;
}

export const UserFormDialog: React.FC<UserFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
}) => {
  const { isAdmin, userStoreId: currentUserStoreId, user: currentUser } = useAuth();
  const { stores } = useStores();
  const { t } = useTranslation();
  const { roles } = useRoles();

  const [formData, setFormData] = useState<User>({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    role: "skladnik",
    storeId: currentUserStoreId || "",
    permissions: [],
    firstLogin: true,
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      const defaultRole = roles.find(r => r.name === 'skladnik');
      setFormData({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        email: "",
        role: "skladnik",
        storeId: currentUserStoreId || "",
        permissions: defaultRole?.permissions || [],
        firstLogin: true,
      });
    }
  }, [user, isOpen, currentUserStoreId, roles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRoleChange = (value: User['role']) => {
    const selectedRole = roles.find(r => r.name === value);
    setFormData((prev) => ({
      ...prev,
      role: value,
      storeId: value === "admin" ? undefined : (prev.storeId || currentUserStoreId || ""),
      permissions: selectedRole?.permissions || [],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.role || !formData.first_name || !formData.last_name || (!formData.storeId && formData.role !== "admin") || !formData.email) {
      toast.error(t("notification.error.fillAllRequiredFields"));
      return;
    }
    if (!user && !formData.password) {
      toast.error(t("notification.error.passwordRequiredForNewUser"));
      return;
    }
    await onSubmit(formData);
    onClose();
  };

  const availableStores = isAdmin
    ? stores
    : stores.filter(s => s.id === currentUserStoreId);

  const isRoleSelectDisabled = !isAdmin && user?.username === currentUser?.email;

  const isStoreSelectDisabled = !isAdmin && !!currentUserStoreId && formData.role !== "admin";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? t("form.description.editUser") : t("form.description.addUser")}</DialogTitle>
          <DialogDescription>
            {user ? t("form.description.editUser") : t("form.description.addUser")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="sm:text-right">
              {t("form.label.username")}
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
            <Label htmlFor="email" className="sm:text-right">
              {t("form.label.email")}
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="col-span-3"
              readOnly={!!user}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="first_name" className="sm:text-right">
              {t("form.label.firstName")}
            </Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="last_name" className="sm:text-right">
              {t("form.label.lastName")}
            </Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="sm:text-right">
              {t("form.label.password")}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password || ""}
              onChange={handleChange}
              className="col-span-3"
              placeholder={user ? t("form.placeholder.enterNewPasswordOptional") : t("form.placeholder.enterPassword")}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="sm:text-right">
              {t("form.label.role")}
            </Label>
            <Select onValueChange={handleRoleChange} value={formData.role} disabled={isRoleSelectDisabled}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t("form.placeholder.selectRole")} />
              </SelectTrigger>
              <SelectContent>
                {isAdmin && <SelectItem value="admin">{t("role.admin")}</SelectItem>}
                <SelectItem value="vedouci_skladu">{t("role.warehouseManager")}</SelectItem>
                <SelectItem value="store_manager">{t("role.storeManager")}</SelectItem>
                <SelectItem value="deputy_store_manager">{t("role.deputyStoreManager")}</SelectItem>
                <SelectItem value="ar_assistant_of_sale">{t("role.arAssistantOfSale")}</SelectItem>
                <SelectItem value="skladnik">{t("role.warehouseWorker")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.role !== "admin" && (
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="storeId" className="sm:text-right">
                {t("form.label.storeId")}
              </Label>
              <Select
                onValueChange={handleStoreSelect}
                value={formData.storeId || ""}
                disabled={isStoreSelectDisabled}
                key={stores.length} // Changed from availableStores.length to stores.length
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("form.placeholder.selectStore")} />
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

          <div className="col-span-full mt-4">
            <Label className="text-base font-semibold mb-2 block">{t("form.label.permissions")}</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allPermissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission}
                    checked={formData.permissions.includes(permission)}
                    onCheckedChange={(checked) => handlePermissionChange(permission, !!checked)}
                    disabled={!isAdmin && formData.role === "admin"}
                  />
                  <Label htmlFor={permission} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t(permissionDescriptions[permission])}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="col-span-full mt-4">
            <Button type="submit" className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
              {user ? t("common.saveChanges") : t("button.addUser")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};