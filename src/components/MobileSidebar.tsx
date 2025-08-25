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
  Settings,
  Globe,
  ClipboardList,
  FileCheck,
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

  const closeSheet = () => setIsOpen(false);

  const AdminNav = () => (
    <nav className="grid gap-2 text-lg font-medium">
      <Link to="/" className="flex items-center gap-2 text-lg font-semibold mb-4" onClick={closeSheet}>
        <Package className="h-6 w-6 text-jyskBlue-dark" />
        <span>JYSK WMS</span>
      </Link>
      <h3 className="my-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("common.admin.systemManagement")}</h3>
      <NavLink to="/admin/site-dashboard" end className={navLinkClasses} onClick={closeSheet}>
        <Home className="h-5 w-5" />
        {t("common.siteDashboard")}
      </NavLink>
      <NavLink to="/spravovat-artikly" className={navLinkClasses} onClick={closeSheet}>
        <Globe className="h-5 w-5" />
        {t("common.globalArticleManagement")}
      </NavLink>
    </nav>
  );

  const UserNav = () => (
     <nav className="grid gap-2 text-lg font-medium">
      <Link to="/" className="flex items-center gap-2 text-lg font-semibold mb-4" onClick={closeSheet}>
        <Package className="h-6 w-6 text-jyskBlue-dark" />
        <span>JYSK WMS</span>
      </Link>
      <NavLink to="/" end className={navLinkClasses} onClick={closeSheet}>
        <Home className="h-5 w-5" />
        {t("common.dashboard")}
      </NavLink>

      <h3 className="my-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("common.warehouse")}</h3>
      {hasPermission("audit:view_results") && (
        <NavLink to="/audity" className={navLinkClasses} onClick={closeSheet}>
          <FileCheck className="h-5 w-5" />
          {t("common.audit.audits")}
        </NavLink>
      )}
      <NavLink to="/doplnovani" className={navLinkClasses} onClick={closeSheet}>
        <RefreshCw className="h-5 w-5" />
        {t("common.replenishment")}
      </NavLink>

      <h3 className="my-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("common.management")}</h3>
      {hasPermission("task:view") && (
        <NavLink to="/ukoly" className={navLinkClasses} onClick={closeSheet}>
          <ClipboardList className="h-5 w-5" />
          {t("common.task.taskManagement")}
        </NavLink>
      )}
      {hasPermission("article:view") && (
        <NavLink to="/spravovat-artikly" className={navLinkClasses} onClick={closeSheet}>
          <Boxes className="h-5 w-5" />
          {t("common.articleManagement")}
        </NavLink>
      )}
      {hasPermission("rack:view") && (
        <NavLink to="/admin/regaly" className={navLinkClasses} onClick={closeSheet}>
          <Warehouse className="h-5 w-5" />
          {t("common.rackManagement")}
        </NavLink>
      )}
    </nav>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t("common.openMenu")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        {isAdmin ? <AdminNav /> : <UserNav />}
        <div className="mt-auto">
          <NavLink to="/help-center" className={navLinkClasses} onClick={closeSheet}>
            <LifeBuoy className="h-5 w-5" />
            {t("common.helpCenter")}
          </NavLink>
           <NavLink to="/account-settings" className={navLinkClasses} onClick={closeSheet}>
            <Settings className="h-5 w-5" />
            {t("common.accountSettings")}
          </NavLink>
        </div>
      </SheetContent>
    </Sheet>
  );
};