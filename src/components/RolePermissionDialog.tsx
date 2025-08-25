import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Role, useRoles } from "@/data/roles";
import { Permission, allPermissions, permissionDescriptions } from "@/data/users";
import { useTranslation } from "react-i18next";

interface RolePermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

export const RolePermissionDialog: React.FC<RolePermissionDialogProps> = ({ isOpen, onClose, role }) => {
  const { t } = useTranslation();
  const { updateRolePermissions } = useRoles();
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    if (role) {
      setSelectedPermissions(role.permissions);
    }
  }, [role]);

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    setSelectedPermissions(prev =>
      checked ? [...prev, permission] : prev.filter(p => p !== permission)
    );
  };

  const handleSubmit = async () => {
    if (!role) return;
    await updateRolePermissions({ roleId: role.id, permissions: selectedPermissions });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("common.permission.editTitle", { roleName: role?.name })}</DialogTitle>
          <DialogDescription>{t("common.permission.editDescription")}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow border rounded-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allPermissions.map(permission => (
              <div key={permission} className="flex items-center space-x-2">
                <Checkbox
                  id={permission}
                  checked={selectedPermissions.includes(permission)}
                  onCheckedChange={checked => handlePermissionChange(permission, !!checked)}
                />
                <Label htmlFor={permission} className="text-sm font-normal">
                  {t(permissionDescriptions[permission])}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={handleSubmit}>{t("common.saveChanges")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};