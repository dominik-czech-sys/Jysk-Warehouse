import React, { useState } from "react";
import { useRoles, Role } from "@/data/roles";
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
import { Edit } from "lucide-react";
import { RolePermissionDialog } from "@/components/RolePermissionDialog";

export const RoleManagementSection: React.FC = () => {
  const { t } = useTranslation();
  const { roles, isLoading } = useRoles();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{t("common.permission.roleList")}</h2>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.role")}</TableHead>
              <TableHead>{t("common.description")}</TableHead>
              <TableHead>{t("common.permission.permissionCount")}</TableHead>
              <TableHead className="text-right">{t("common.action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center">{t("common.permission.loadingRoles")}</TableCell></TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>{role.permissions.length}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditRole(role)}>
                      <Edit className="h-4 w-4 mr-2" /> {t("common.permission.editPermissions")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <RolePermissionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        role={selectedRole}
      />
    </div>
  );
};