import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Permission } from "./users";

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

const fetchRoles = async (): Promise<Role[]> => {
  const { data: roles, error: rolesError } = await supabase.from("roles").select("*");
  if (rolesError) throw rolesError;

  const { data: permissions, error: permsError } = await supabase.from("role_permissions").select("*");
  if (permsError) throw permsError;

  return roles.map(role => ({
    ...role,
    permissions: permissions.filter(p => p.role_id === role.id).map(p => p.permission as Permission),
  }));
};

const updateRolePermissionsInDb = async ({ roleId, permissions }: { roleId: string; permissions: Permission[] }) => {
  // Delete existing permissions for the role
  const { error: deleteError } = await supabase.from("role_permissions").delete().eq("role_id", roleId);
  if (deleteError) throw deleteError;

  // Insert new permissions
  if (permissions.length > 0) {
    const permissionsToInsert = permissions.map(permission => ({
      role_id: roleId,
      permission: permission,
    }));
    const { error: insertError } = await supabase.from("role_permissions").insert(permissionsToInsert);
    if (insertError) throw insertError;
  }
  
  return { roleId, permissions };
};

export const useRoles = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: roles, isLoading, error } = useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });

  const updateRolePermissionsMutation = useMutation({
    mutationFn: updateRolePermissionsInDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["userPermissions"] }); // Invalidate user permissions to force re-fetch
      toast.success(t("common.permission.updateSuccess"));
    },
    onError: (err) => toast.error(err.message),
  });

  return {
    roles: roles || [],
    isLoading,
    error,
    updateRolePermissions: updateRolePermissionsMutation.mutateAsync,
  };
};