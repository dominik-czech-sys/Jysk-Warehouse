import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  Package,
  Home,
  Boxes,
  Warehouse,
  Users,
  LifeBuoy,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

export const MobileSidebar: React.FC = () => {
  const { isAdmin, hasPermission } = useAuth();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-4 rounded-xl px-3 py-2 ${
      isActive
        ? "bg-muted text-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t("common.openMenu")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <nav className="grid gap-2 text-lg font-medium">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold mb-4"
            onClick={() => setIsOpen(false)}
          >
            <Package className="h-6 w-6 text-jyskBlue-dark" />
            <span>JYSK WMS</span>
          </Link>
          <NavLink to="/" end className={navLinkClasses} onClick={() => setIsOpen(false)}>
            <Home className="h-5 w-5" />
            {t("common.dashboard")}
          </NavLink>

          <h3 className="my-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("common.warehouse")}</h3>
          <NavLink to="/doplnovani" className={navLinkClasses} onClick={() => setIsOpen(false)}>
            <RefreshCw className="h-5 w-5" />
            {t("common.replenishment")}
          </NavLink>

          <h3 className="my-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("common.management")}</h3>
          {hasPermission("article:view") && (
            <NavLink to="/spravovat-artikly" className={navLinkClasses} onClick={() => setIsOpen(false)}>
              <Boxes className="h-5 w-5" />
              {t("common.articleManagement")}
            </NavLink>
          )}
          {hasPermission("rack:view") && (
            <NavLink to="/admin/regaly" className={navLinkClasses} onClick={() => setIsOpen(false)}>
              <Warehouse className="h-5 w-5" />
              {t("common.rackManagement")}
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin/site-dashboard" className={navLinkClasses} onClick={() => setIsOpen(false)}>
              <Users className="h-5 w-5" />
              {t("common.siteDashboard")}
            </NavLink>
          )}
        </nav>
        <div className="mt-auto">
          <NavLink to="/help-center" className={navLinkClasses} onClick={() => setIsOpen(false)}>
            <LifeBuoy className="h-5 w-5" />
            {t("common.helpCenter")}
          </NavLink>
        </div>
      </SheetContent>
    </Sheet>
  );
};