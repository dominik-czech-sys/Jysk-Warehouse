import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Boxes, LayoutDashboard, Warehouse } from "lucide-react"; // Odstraněn ScrollText
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next"; // Import useTranslation

interface ManagementMenuProps {
  // onViewLog: () => void; // Odstraněn prop
}

export const ManagementMenu: React.FC<ManagementMenuProps> = (/* { onViewLog } */) => {
  const { hasPermission, isAdmin } = useAuth();
  const { t } = useTranslation(); // Initialize useTranslation

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full sm:w-auto">
          <LayoutDashboard className="h-4 w-4 mr-2" /> {t("common.management")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {hasPermission("article:view") && (
          <DropdownMenuItem asChild>
            <Link to="/spravovat-artikly" className="flex items-center">
              <Boxes className="h-4 w-4 mr-2" /> {t("common.articleManagement")}
            </Link>
          </DropdownMenuItem>
        )}
        {!isAdmin && hasPermission("rack:view") && ( // Only show for non-admins with rack:view permission
          <DropdownMenuItem asChild>
            <Link to="/admin/regaly" className="flex items-center">
              <Warehouse className="h-4 w-4 mr-2" /> {t("common.rackManagement")}
            </Link>
          </DropdownMenuItem>
        )}
        {/* Odkaz na LogViewer byl přesunut do SiteDashboard */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};