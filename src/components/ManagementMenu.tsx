import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Boxes, LayoutDashboard, Warehouse } from "lucide-react";
import { useAuth } from "@/hooks/useAuth"; // Import useAuth

export const ManagementMenu: React.FC = () => {
  const { hasPermission } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full sm:w-auto">
          <LayoutDashboard className="h-4 w-4 mr-2" /> Správa
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {hasPermission("article:view") && (
          <DropdownMenuItem asChild>
            <Link to="/spravovat-clanky" className="flex items-center">
              <Boxes className="h-4 w-4 mr-2" /> Správa článků
            </Link>
          </DropdownMenuItem>
        )}
        {hasPermission("rack:view") && (
          <DropdownMenuItem asChild>
            <Link to="/admin/regaly" className="flex items-center">
              <Warehouse className="h-4 w-4 mr-2" /> Správa regálů
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};