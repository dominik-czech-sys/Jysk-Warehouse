import React, { useState, useEffect } from "react";
import {
  Dialog, // Ensure Dialog is imported
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
import { useStores } from "@/data/stores";
import { useTranslation } from "react-i18next";

const allPermissions: Permission[] = [
  "user:view", "user:create", "user:update", "user:delete",
  "store:view", "store:create", "store:update", "store:delete",
  "rack:view", "rack:create", "rack:update", "rack:delete",
  "article:view", "article:create", "article:update", "article:delete", "article:scan", "article:mass_add", "article:transfer",
  "log:view",
  "default_articles:manage",
  "article:copy_from_store",
  "help_posts:manage",
  "task:view", "task:create", "task:update", "task:delete",
];

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
  "article:transfer": "permission.article.transfer",
  "log:view": "permission.log.view",
  "default_articles:manage": "permission.defaultArticles.manage",
  "article:copy_from_store": "permission.article.copyFromStore",
  "help_posts:manage": "permission.helpPosts.manage",
  "task:view": "permission.task.view",
  "task:create": "permission.task.create",
  "task:update": "permission.task.update",
  "task:delete": "permission.task.delete",
};

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

  const [formData, setFormData] = useState<User>({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    role: "skladnik",
    storeId: currentUserStoreId || "",
    permissions: defaultPermissions["skladnik"],
    firstLogin: true,
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        email: "",
        role: "skladnik",
        storeId: currentUserStoreId || "",
        permissions: defaultPermissions["skladnik"],
        firstLogin: true,
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
      storeId: value === "admin" ? undefined : (prev.storeId || currentUserStoreId || ""),
      permissions: defaultPermissions[value] || [],
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
      toast.error(t("common.fillAllRequiredFields"));
      return;
    }
    if (!user && !formData.password) {
      toast.error(t("common.passwordRequiredForNewUser"));
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
            <Label htmlFor="email" className="sm:text-right">
              {t("common.email")}
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
              {t("common.firstName")}
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
              {t("common.lastName")}
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
              {t("common.password")}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password || ""}
              onChange={handleChange}
              className="col-span-3"
              placeholder={user ? t("common.enterNewPasswordOptional") : t("common.enterPassword")}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="sm:text-right">
              {t("common.role")}
            </Label>
            <Select onValueChange={handleRoleChange} value={formData.role} disabled={isRoleSelectDisabled}>
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
                disabled={isStoreSelectDisabled}
                key={stores.length} // Changed from availableStores.length to stores.length
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

          <div className="col-span-full mt-4">
            <Label className="text-base font-semibold mb-2 block">{t("common.permissions")}</Label>
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
              {user ? t("common.saveChanges") : t("common.addUser")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};