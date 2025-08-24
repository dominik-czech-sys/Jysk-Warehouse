import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Package, Store, Users, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { user, logout, hasPermission } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    {
      title: t("sidebar.dashboard"),
      href: "/",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
      permission: "user:view", // Všichni přihlášení uživatelé mohou vidět dashboard
    },
    {
      title: t("sidebar.users"),
      href: "/users",
      icon: <Users className="mr-2 h-4 w-4" />,
      permission: "user:view",
    },
    {
      title: t("sidebar.stores"),
      href: "/stores",
      icon: <Store className="mr-2 h-4 w-4" />,
      permission: "store:view",
    },
    {
      title: t("sidebar.racks"),
      href: "/racks",
      icon: <Package className="mr-2 h-4 w-4" />,
      permission: "rack:view",
    },
    {
      title: t("sidebar.articles"),
      href: "/articles",
      icon: <Package className="mr-2 h-4 w-4" />,
      permission: "article:view",
    },
    {
      title: t("sidebar.settings"),
      href: "/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
      permission: "user:view", // Nastavení může vidět každý přihlášený
    },
  ];

  return (
    <div className={cn("pb-12 w-64 border-r bg-sidebar dark:bg-sidebar-background", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-sidebar-primary dark:text-sidebar-primary-foreground">
            JYSK Sklad
          </h2>
          <div className="space-y-1">
            {navItems.map((item) =>
              hasPermission(item.permission as any) ? ( // Přetypování na any, protože Permission je string literal type
                <Link key={item.href} to={item.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    {item.icon}
                    {item.title}
                  </Button>
                </Link>
              ) : null
            )}
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-sidebar-primary dark:text-sidebar-primary-foreground">
            {t("sidebar.account")}
          </h2>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t("sidebar.logout")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;